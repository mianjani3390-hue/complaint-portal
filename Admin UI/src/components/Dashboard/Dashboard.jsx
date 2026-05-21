import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { supabase, formatStatus, statusBadgeClass, isSupabaseConfigured } from '../../lib/supabase';
import { card, btnPrimary, link, th, td } from '../../lib/ui';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const CHART_BLUE = '#2563eb';
const CHART_BLUES = ['#1d4ed8', '#f59e0b','#6b7280', '#10b981', ];
const DASHBOARD_TIMEOUT_MS = 10000;

function withTimeout(promise) {
  let timeoutId;
  const timeout = new Promise((resolve) => {
    timeoutId = window.setTimeout(
      () => resolve({ data: null, error: { message: 'Supabase request timed out' } }),
      DASHBOARD_TIMEOUT_MS
    );
  });

  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, today: 0 });
  const [recent, setRecent] = useState([]);
  const [chartData, setChartData] = useState({ trend: null, status: null });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setFetchError('');

      if (!isSupabaseConfigured) {
        setFetchError('Supabase not configured. Add keys to .env and restart npm run dev.');
        setLoading(false);
        return;
      }

      try {
        const [allRes, recentRes] = await Promise.all([
          withTimeout(supabase.from('complaints').select('status, created_at')),
          withTimeout(
            supabase
              .from('complaints')
              .select('id, complaint_code, title, user_name, status, created_at')
              .order('created_at', { ascending: false })
              .limit(5)
          ),
        ]);

        if (!mounted) return;

        if (allRes.error) {
          setFetchError(allRes.error.message);
          return;
        }

        if (recentRes.error) {
          setFetchError(recentRes.error.message);
          return;
        }

        const rows = allRes.data || [];
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayIso = todayStart.toISOString();

        setStats({
          total: rows.length,
          pending: rows.filter((r) => r.status === 'pending').length,
          new: rows.filter((r) => r.status === 'new').length,
          resolved: rows.filter((r) => r.status === 'resolved').length,
          today: rows.filter((r) => r.created_at >= todayIso).length,
        });
        setRecent(recentRes.data || []);

        const statusCounts = { new: 0, pending: 0, in_progress: 0, resolved: 0 };
        rows.forEach((r) => {
          if (statusCounts[r.status] !== undefined) statusCounts[r.status]++;
        });

        const last7 = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          d.setHours(0, 0, 0, 0);
          return d;
        });

        setChartData({
          trend: {
            labels: last7.map((d) => d.toLocaleDateString('en-GB', { weekday: 'short' })),
            datasets: [
              {
                label: 'Complaints',
                data: last7.map((d) => {
                  const next = new Date(d);
                  next.setDate(next.getDate() + 1);
                  return rows.filter((r) => {
                    const t = new Date(r.created_at);
                    return t >= d && t < next;
                  }).length;
                }),
                borderColor: CHART_BLUE,
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                tension: 0.4,
                borderWidth: 3,
              },
            ],
          },
          status: {
            labels: ['New', 'Pending', 'In Progress', 'Resolved'],
            datasets: [
              {
                data: [
                  statusCounts.new,
                  statusCounts.pending,
                  statusCounts.in_progress,
                  statusCounts.resolved,
                ],
                backgroundColor: CHART_BLUES,
              },
            ],
          },
        });
      } catch (err) {
        if (mounted) setFetchError(err.message || 'Could not load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <p className="text-slate-500">Loading dashboard...</p>;

  if (fetchError) {
    return (
      <div className={`${card} border border-amber-200 bg-amber-50 p-6 text-amber-900`}>
        <p className="font-semibold">Could not load dashboard</p>
        <p className="mt-2 text-sm">{fetchError}</p>
        <p className="mt-2 text-sm">Check Settings page for Supabase status, or sign in if required.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Total Complaints', value: stats.total },
          { label: 'New', value: stats.new, accent: true },
          { label: 'Pending ', value: stats.pending, accent: true },
          { label: 'Resolved', value: stats.resolved },
          { label: 'Complaints Today', value: stats.today },
        ].map((s) => (
          <div key={s.label} className={`${card} p-6`}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`mt-2 text-4xl font-bold ${s.accent ? 'text-sky-500' : 'text-blue-700'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${card} p-6 lg:col-span-2`}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-blue-900">Complaints Trend (7 days)</h2>
            <Link to="/complaints" className={link}>
              View All
            </Link>
          </div>
          {chartData.trend && (
            <Line data={chartData.trend} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          )}
        </div>
        <div className={`${card} p-6`}>
          <h2 className="mb-6 text-xl font-bold text-blue-900">Status Distribution</h2>
          {chartData.status && (
            <Doughnut data={chartData.status} options={{ responsive: true, cutout: '65%' }} />
          )}
        </div>
      </div>

      <div className={`${card} p-6`}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-900">Recent Complaints</h2>
          <Link to="/complaints" className={`${btnPrimary} !px-5 !py-2 text-sm`}>
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Title</th>
                <th className={th}>User</th>
                <th className={th}>Status</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50/50">
                  <td className={`${td} font-semibold`}>{c.complaint_code}</td>
                  <td className={td}>{c.title}</td>
                  <td className={td}>{c.user_name}</td>
                  <td className={td}>
                    <span className={statusBadgeClass(c.status)}>{formatStatus(c.status)}</span>
                  </td>
                  <td className={td}>
                    <Link to={`/complaints/${c.id}`} className={link}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No complaints yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
