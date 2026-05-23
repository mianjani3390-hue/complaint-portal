import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  supabase,
  PAGE_SIZE,
  STATUS_OPTIONS,
  formatStatus,
  statusBadgeClass,
  formatDate,
} from '../../lib/supabase';
import { card, btnPrimary, btnSecondary, input, link, th, td, tableWrap } from '../../lib/ui';

const ADMIN_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m21 21-4.35-4.35" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}

function statusSelectClass(status) {
  return `min-w-[9rem] rounded-full border px-3 py-2 text-xs font-semibold outline-none transition-colors focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${statusBadgeClass(
    status
  )
    .replace('inline-block', '')
    .replace('px-4 py-1.5', '')}`;
}

export default function AllComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError('');
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('complaints')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (statusFilter) query = query.eq('status', statusFilter);
    if (search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(
        `title.ilike.${term},user_name.ilike.${term},complaint_code.ilike.${term},department.ilike.${term}`
      );
    }

    const { data, count, error: qErr } = await query;
    if (qErr) {
      setError(qErr.message);
      setComplaints([]);
      setTotal(0);
    } else {
      setComplaints(data || []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleStatusChange = async (complaintId, nextStatus) => {
    setUpdatingStatusId(complaintId);
    setError('');

    const { error: updateError } = await supabase
      .from('complaints')
      .update({ status: nextStatus })
      .eq('id', complaintId);

    if (updateError) {
      setError(updateError.message);
    } else {
      setComplaints((rows) =>
        rows.map((complaint) =>
          complaint.id === complaintId ? { ...complaint, status: nextStatus } : complaint
        )
      );
    }

    setUpdatingStatusId(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints..."
            className={`${input} w-52 sm:w-80 border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-300`}
          />
          <button type="submit" className={`${btnPrimary} !px-4 !py-2.5`} aria-label="Search">
            <SearchIcon />
          </button>
        </form>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[10rem] rounded-full border border-blue-200 bg-white px-4 py-2.5 text-blue-900 outline-none focus:border-blue-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className={`${card} overflow-hidden`}>
        <div className={tableWrap}>
          <table className="w-full min-w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Title</th>
                <th className={th}>User</th>
                <th className={th}>Department</th>
                <th className={th}>Date</th>
                <th className={th}>Status</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No complaints found
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const canShowSelected = ADMIN_STATUS_OPTIONS.some((opt) => opt.value === c.status);

                  return (
                    <tr key={c.id} className="transition-colors hover:bg-blue-50/50">
                      <td className={`${td} font-semibold whitespace-nowrap`}>{c.complaint_code}</td>
                      <td className={td}>{c.title}</td>
                      <td className={td}>{c.user_name}</td>
                      <td className={td}>{c.department || '-'}</td>
                      <td className={`${td} text-slate-500 whitespace-nowrap`}>{formatDate(c.created_at)}</td>
                      <td className={td}>
                        <select
                          value={canShowSelected ? c.status : ''}
                          disabled={updatingStatusId === c.id}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          className={statusSelectClass(c.status)}
                          aria-label={`Change status for ${c.complaint_code}`}
                        >
                          {!canShowSelected && (
                            <option value="" disabled>
                              {formatStatus(c.status)}
                            </option>
                          )}
                          {ADMIN_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={td}>
                        <Link to={`/complaints/${c.id}`} className={link}>
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-blue-100 px-6 py-4 text-sm">
            <p className="text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={btnSecondary}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="text-slate-600">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                className={btnSecondary}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
