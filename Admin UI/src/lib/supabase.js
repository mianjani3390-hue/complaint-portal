import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase not configured. Copy .env.example to .env and add your project URL + anon key.'
  );
}

// Must not pass empty strings — createClient throws and React shows a blank page
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTk5NzM0NTIwMH0.placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export const PAGE_SIZE = 20;

export const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export function formatStatus(status) {
  const map = {
    new: 'New',
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };
  return map[status] || status;
}

const STATUS_BADGE = {
  new: 'bg-blue-100 text-blue-800',
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-slate-200 text-slate-900',
  resolved: 'bg-green-600 text-white',
};

export function statusBadgeClass(status) {
  const key = status === 'in_progress' ? 'in_progress' : status || 'new';
  return `inline-block rounded-full px-4 py-1.5 text-xs font-semibold ${STATUS_BADGE[key] || STATUS_BADGE.new}`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export async function checkSupabaseConnection() {
  if (!isSupabaseConfigured) {
    return {
      configured: false,
      connected: false,
      message: 'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart npm run dev',
    };
  }

  try {
    const { error } = await supabase.from('complaints').select('id').limit(1);

    if (!error) {
      return { configured: true, connected: true, message: 'Supabase connected' };
    }

    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      return {
        configured: true,
        connected: false,
        message: 'Connected but tables missing — run supabase/schema.sql',
      };
    }

    if (
      error.code === '42501' ||
      error.message?.includes('permission') ||
      error.message?.includes('JWT')
    ) {
      return {
        configured: true,
        connected: true,
        message: 'Supabase reachable (sign in to load data)',
      };
    }

    if (error.message?.includes('Invalid API key')) {
      return { configured: true, connected: false, message: 'Invalid anon API key in .env' };
    }

    return { configured: true, connected: false, message: error.message };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      message: err.message || 'Network error — check URL and internet',
    };
  }
}
