import { useSupabaseHealth } from '../../hooks/useSupabaseHealth';
import { btnSecondary } from '../../lib/ui';

export default function SupabaseStatus({ compact = false }) {
  const { loading, configured, connected, message, refresh } = useSupabaseHealth();

  if (loading) {
    return <p className="text-sm text-slate-500">Checking Supabase connection…</p>;
  }

  const ok = configured && connected;
  const boxClass = ok
    ? 'border-blue-200 bg-blue-50 text-blue-800'
    : 'border-amber-200 bg-amber-50 text-amber-900';

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${boxClass} ${compact ? '' : 'mb-4'}`}
      role="status"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-semibold">{ok ? '● Supabase OK' : '● Supabase issue'}</span>
          {!compact && <p className="mt-1 opacity-90">{message}</p>}
          {compact && <span className="ml-2 opacity-90">— {message}</span>}
        </div>
        <button type="button" onClick={refresh} className={btnSecondary}>
          Recheck
        </button>
      </div>
    </div>
  );
}
