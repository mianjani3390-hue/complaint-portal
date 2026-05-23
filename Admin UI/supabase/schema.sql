-- ComplaintHub Supabase schema
-- Run in Supabase SQL Editor after creating your project.

-- Roles: super_admin | admin
create type public.app_role as enum ('super_admin', 'admin');

-- Complaint status: new (default on submit) | pending | in_progress | resolved
create type public.complaint_status as enum ('new', 'pending', 'in_progress', 'resolved');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'admin',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_code text unique,
  title text not null,
  description text,
  user_name text not null,
  user_email text,
  user_id uuid references auth.users (id) on delete set null,
  department text,
  status public.complaint_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_complaint_code()
returns trigger
language plpgsql
as $$
begin
  if new.complaint_code is null then
    new.complaint_code := 'C-' || lpad((floor(random() * 999999))::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger complaints_set_code
  before insert on public.complaints
  for each row execute function public.set_complaint_code();

create or replace function public.touch_complaint_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger complaints_updated_at
  before update on public.complaints
  for each row execute function public.touch_complaint_updated_at();

-- Auto-create profile on signup.
-- The first account becomes super_admin; later signups become admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  first_profile boolean;
begin
  select not exists (select 1 from public.profiles) into first_profile;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    case
      when first_profile then 'super_admin'::public.app_role
      else coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'admin')
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid() and is_active = true;
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active = true
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_active = true
      and role = 'super_admin'
  );
$$;

-- Super admin removes (deactivates) an admin
create or replace function public.remove_admin(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only super admin can remove admins';
  end if;
  if target_id = auth.uid() then
    raise exception 'Cannot remove yourself';
  end if;
  update public.profiles
  set is_active = false
  where id = target_id and role = 'admin';
end;
$$;

grant execute on function public.remove_admin(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.complaints enable row level security;

-- Profiles policies
create policy "Staff read profiles"
  on public.profiles for select
  to authenticated
  using (public.is_staff());

create policy "Users read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Super admin update admins"
  on public.profiles for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Complaints policies
create policy "Staff read complaints"
  on public.complaints for select
  to authenticated
  using (public.is_staff());

create policy "Staff update complaints"
  on public.complaints for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Users read own complaints
create policy "Users read own complaints"
  on public.complaints for select
  to authenticated
  using (auth.uid() = user_id);

-- Public/citizen app can insert (optional – tighten if you use service role only)
create policy "Anyone insert complaint"
  on public.complaints for insert
  to anon, authenticated
  with check (true);

-- Profile picture storage
insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do nothing;

create policy "Anyone read profile pictures"
  on storage.objects for select
  using (bucket_id = 'profile-pictures');

create policy "Users upload own profile pictures"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users update own profile pictures"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'profile-pictures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Seed sample complaints (run once)
-- insert into public.complaints (title, user_name, department, status) values
--   ('Street Light Not Working', 'Ahmed Ali', 'Electricity', 'new');

-- If your first account already exists from an older schema, promote it once:
-- update public.profiles set role = 'super_admin' where email = 'you@example.com';
