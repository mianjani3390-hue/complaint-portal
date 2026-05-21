import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, formatDate } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { card, th, td, tableWrap } from '../../lib/ui';

export default function Users() {
  const { isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const loadAdmins = async () => {
    setLoading(true);
    setError('');

    const { data, error: qErr } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'super_admin'])
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (qErr) setError(qErr.message);
    else setAdmins(data || []);

    setLoading(false);
  };

  useEffect(() => {
    if (isSuperAdmin) loadAdmins();
  }, [isSuperAdmin]);

  if (!isSuperAdmin) return <Navigate to="/" replace />;

  const handleDelete = async (adminId, role) => {
    if (role === 'super_admin') return;
    if (!window.confirm('Delete this admin? They will no longer be able to sign in.')) return;

    setRemovingId(adminId);
    setError('');

    const { error: rpcErr } = await supabase.rpc('remove_admin', { target_id: adminId });

    if (rpcErr) {
      setError(rpcErr.message);
    } else {
      await loadAdmins();
    }

    setRemovingId(null);
  };

  return (
    <div className={`${card} overflow-hidden`}>
      <p className="border-b border-blue-100 px-6 py-4 text-sm text-slate-500">
        Manage admin accounts. Super admins can delete regular admins.
      </p>

      {error && <p className="px-6 py-3 text-sm text-red-600">{error}</p>}

      <div className={tableWrap}>
        <table className="w-full min-w-[640px]">
          <thead className="bg-blue-50">
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Email</th>
              <th className={th}>Role</th>
              <th className={th}>Joined</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : (
              admins.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/50">
                  <td className={`${td} font-semibold`}>{u.full_name || '-'}</td>
                  <td className={td}>{u.email}</td>
                  <td className={td}>
                    <span
                      className={`inline-block rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${
                        u.role === 'super_admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`${td} text-slate-500`}>{formatDate(u.created_at)}</td>
                  <td className={td}>
                    {u.role === 'admin' ? (
                      <button
                        type="button"
                        className="text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                        disabled={removingId === u.id}
                        onClick={() => handleDelete(u.id, u.role)}
                      >
                        {removingId === u.id ? 'Deleting...' : 'Delete'}
                      </button>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
