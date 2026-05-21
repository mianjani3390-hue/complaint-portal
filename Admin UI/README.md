# ComplaintHub Admin (React + Supabase)

Admin dashboard — **React**, **Vite**, **Tailwind**, **Supabase**.

## Project structure

```
src/
  assets/          # images (logo.png)
  components/      # each page: Component.jsx (Tailwind classes)
  lib/ui.js        # shared Tailwind class strings
  contexts/
  lib/
  App.jsx
  main.jsx
  index.css        # global theme (bright blue)
supabase/
  schema.sql
```

## Setup

1. Run `supabase/schema.sql` in your Supabase SQL Editor.
2. Create an admin user and promote to super admin:

```sql
update public.profiles set role = 'super_admin' where email = 'your@email.com';
```

3. Copy `.env.example` to `.env` and add your Supabase URL and anon key.

4. Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Check Supabase is working

1. **Login page** — yellow/blue box shows connection status (Recheck button).
2. **Settings** — same status panel after you sign in.
3. **Browser console** (F12) — no `Missing VITE_SUPABASE_URL` warning if `.env` is correct.
4. **Supabase Dashboard** → Table Editor → `complaints`, `profiles` must exist (`supabase/schema.sql`).

If status says "Missing .env keys", create `.env` from `.env.example` and restart `npm run dev`.

## Features

- Bright blue UI theme
- Login / protected routes
- Dashboard with live stats
- All Complaints — filter, search, 20 per page pagination
- Complaint detail — update status
- Users (super admin) — remove admins
- Settings — change password
