import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase, formatStatus, statusBadgeClass, formatDate } from '../../lib/supabase';
import { card, btnPrimary, link, label, alertSuccess, alertError } from '../../lib/ui';

const ADMIN_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase.from('complaints').select('*').eq('id', id).maybeSingle();
      if (error || !data) setComplaint(null);
      else {
        setComplaint(data);
        setStatus(data.status);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSaveStatus = async () => {
    if (!complaint) return;
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('complaints').update({ status }).eq('id', complaint.id);
    if (error) setMessage(error.message);
    else {
      setComplaint({ ...complaint, status });
      setMessage('Status updated successfully.');
    }
    setSaving(false);
  };

  if (loading) return <p className="text-slate-500">Loading complaint…</p>;

  if (!complaint) {
    return (
      <div className={`${card} p-8 text-center`}>
        <p className="text-slate-600">Complaint not found.</p>
        <Link to="/complaints" className={`${link} mt-4 inline-block`}>
          Back to all complaints
        </Link>
      </div>
    );
  }

  const success = message.includes('success');

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <button
        type="button"
        className="text-left text-sm text-blue-700 hover:underline"
        onClick={() => navigate('/complaints')}
      >
        ← Back to all complaints
      </button>
      <article className={`${card} space-y-6 p-8`}>
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{complaint.complaint_code}</p>
            <h2 className="mt-1 text-2xl font-semibold text-blue-900">{complaint.title}</h2>
          </div>
          <span className={statusBadgeClass(complaint.status)}>{formatStatus(complaint.status)}</span>
        </header>
        <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Submitted by</dt>
            <dd className="font-medium text-slate-800">{complaint.user_name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">{complaint.user_email || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Department</dt>
            <dd className="font-medium text-slate-800">{complaint.department || '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Date</dt>
            <dd className="font-medium text-slate-800">{formatDate(complaint.created_at)}</dd>
          </div>
        </dl>
        {complaint.description && (
          <section>
            <h3 className="text-sm font-medium text-slate-500">Description</h3>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">{complaint.description}</p>
          </section>
        )}
        <section className="border-t-2 border-blue-50 pt-6">
          <h3 className="text-lg font-semibold text-blue-900">Update status</h3>
          <p className="mt-2 text-sm text-slate-500">
            New complaints arrive with status <strong>New</strong>. After reviewing, change the status
            below.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label>
              <span className={label}>Status</span>
              <select
                value={ADMIN_STATUSES.some((s) => s.value === status) ? status : ''}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block min-w-[11rem] rounded-full border border-blue-200 px-4 py-3 outline-none focus:border-blue-500"
              >
                {!ADMIN_STATUSES.some((s) => s.value === status) && (
                  <option value="" disabled>
                    {formatStatus(status)}
                  </option>
                )}
                {ADMIN_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className={btnPrimary}
              onClick={handleSaveStatus}
              disabled={saving || status === complaint.status}
            >
              {saving ? 'Saving…' : 'Save status'}
            </button>
          </div>
          {message && (
            <p className={`mt-3 ${success ? alertSuccess : alertError}`} role="status">
              {message}
            </p>
          )}
        </section>
      </article>
    </div>
  );
}
