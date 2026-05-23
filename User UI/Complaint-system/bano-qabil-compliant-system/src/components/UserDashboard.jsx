import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase_client';
import { useUserAuth } from '../contexts/UserAuthContext';
import {
  formatDate,
  formatStatus,
  getStatusBadgeClass,
  getDaysInfo,
  getRelativeTime,
} from '../lib/complaintUtils';
import {
  FileText,
  ChevronRight,
  AlertCircle,
  LogOut,
  Plus,
  Filter,
  Search,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function UserDashboard() {
  const { user, signOut } = useUserAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch user complaints
  const fetchComplaints = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('complaints')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        setError('Failed to load complaints. Please try again.');
        setComplaints([]);
      } else {
        // Filter out null user_id complaints (backward compatibility)
        const userComplaints = (data || []).filter(c => c.user_id === user.id);
        setComplaints(userComplaints);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while loading complaints.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Apply filters
  useEffect(() => {
    let filtered = complaints;

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Filter by search term (search in title and complaint_code)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.title.toLowerCase().includes(term) ||
          c.complaint_code.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term)
      );
    }

    setFilteredComplaints(filtered);
  }, [complaints, statusFilter, searchTerm]);

  // Fetch complaints on mount and user change
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.error) {
      navigate('/');
    }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending' || c.status === 'new').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-blue-700">Loading your complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, <span className="font-semibold text-gray-900">{user?.email?.split('@')[0]}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/create-complaint')}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus size={18} />
                New Complaint
              </button>

              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Complaints */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="mt-3 text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="mt-2 text-xs text-gray-600">All submitted complaints</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <FileText size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="mt-3 text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="mt-2 text-xs text-gray-600">Awaiting action</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <AlertCircle size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">In Progress</p>
                <p className="mt-3 text-3xl font-bold text-purple-600">{stats.inProgress}</p>
                <p className="mt-2 text-xs text-gray-600">Currently being addressed</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FileText size={24} className="text-purple-600" />
              </div>
            </div>
          </div>

          {/* Resolved */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Resolved</p>
                <p className="mt-3 text-3xl font-bold text-green-600">{stats.resolved}</p>
                <p className="mt-2 text-xs text-gray-600">Successfully closed</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <FileText size={24} className="text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Complaints</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, code, or description..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-10"
                />
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter('')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    statusFilter === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {STATUS_OPTIONS.slice(1).map(option => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      statusFilter === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Complaints List */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {filteredComplaints.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm border border-gray-200">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {complaints.length === 0 ? 'No complaints yet' : 'No matching complaints'}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {complaints.length === 0
                ? 'You haven\'t submitted any complaints yet. Start by creating your first complaint.'
                : 'Try adjusting your search or filters to find what you\'re looking for.'}
            </p>
            {complaints.length === 0 && (
              <button
                onClick={() => navigate('/create-complaint')}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus size={18} />
                Submit Your First Complaint
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map(complaint => {
              const daysInfo = getDaysInfo(complaint);
              const statusColors = {
                new: 'bg-blue-50 border-blue-200',
                pending: 'bg-yellow-50 border-yellow-200',
                in_progress: 'bg-purple-50 border-purple-200',
                resolved: 'bg-green-50 border-green-200',
              };

              return (
                <Link
                  key={complaint.id}
                  to={`/complaint/${complaint.id}`}
                  className={`block rounded-lg border-l-4 p-6 shadow-sm transition hover:shadow-md ${statusColors[complaint.status] || 'bg-white border-gray-200'}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                          <FileText size={20} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-gray-900 truncate">
                            {complaint.title}
                          </h3>
                          <p className="mt-1 text-xs text-gray-600">
                            {complaint.complaint_code} • {complaint.department}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                            {complaint.description}
                          </p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(complaint.status)}`}>
                          {formatStatus(complaint.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Submitted {getRelativeTime(complaint.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Right Info */}
                    <div className="flex flex-shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-600">Days Pending</p>
                        <p className="mt-1 text-lg font-bold text-gray-900">{daysInfo.days}</p>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
