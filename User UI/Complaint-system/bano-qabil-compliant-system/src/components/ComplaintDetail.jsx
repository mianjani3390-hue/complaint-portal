import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase_client';
import { useUserAuth } from '../contexts/UserAuthContext';
import ComplaintTimeline from './ComplaintTimeline';
import {
  formatDate,
  formatDateTime,
  formatStatus,
  getStatusBadgeClass,
  getDaysInfo,
  getRelativeTime,
} from '../lib/complaintUtils';
import { ArrowLeft, AlertCircle, Copy, Check } from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!user?.id || !id) {
        setError('Unauthorized access');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { data, error: fetchError } = await supabase
          .from('complaints')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          setError('Failed to load complaint details.');
          setComplaint(null);
        } else if (!data) {
          setError('Complaint not found or you do not have access to it.');
          setComplaint(null);
        } else {
          setComplaint(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while loading the complaint.');
        setComplaint(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, user?.id]);

  const handleCopyCode = () => {
    if (complaint?.complaint_code) {
      navigator.clipboard.writeText(complaint.complaint_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-blue-700">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-blue-600 transition hover:text-blue-700"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="mt-8 rounded-lg bg-red-50 p-6 border border-red-200">
            <div className="flex items-start gap-4">
              <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-red-900">Error Loading Complaint</h2>
                <p className="mt-2 text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const daysInfo = getDaysInfo(complaint);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Copy size={24} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
                  <p className="mt-1 text-sm text-gray-600">{complaint.department}</p>
                </div>
              </div>
            </div>

            <span
              className={`inline-block flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeClass(complaint.status)}`}
            >
              {formatStatus(complaint.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Reference Code Card */}
        <div className="rounded-lg bg-blue-50 p-6 border border-blue-200 mb-6">
          <p className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Complaint Reference Code</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <code className="rounded-lg bg-white px-4 py-3 font-mono text-xl font-bold text-blue-600 border border-blue-200">
                {complaint.complaint_code}
              </code>
              <p className="mt-2 text-sm text-blue-800">
                Use this code to track your complaint status
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-6">
          {/* Submitted Date */}
          <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Submitted On</p>
            <p className="mt-3 text-lg font-semibold text-gray-900">
              {formatDate(complaint.created_at)}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {getRelativeTime(complaint.created_at)}
            </p>
          </div>

          {/* Days Pending */}
          <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Days Pending</p>
            <p className="mt-3 text-lg font-semibold text-gray-900">
              {daysInfo.days} days
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {daysInfo.estimatedLabel || 'In current status'}
            </p>
          </div>

          {/* Last Updated */}
          <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-600 tracking-wide">Last Updated</p>
            <p className="mt-3 text-lg font-semibold text-gray-900">
              {formatDate(complaint.updated_at)}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              {getRelativeTime(complaint.updated_at)}
            </p>
          </div>
        </div>

        {/* Description Card */}
        <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm mb-6">
          <h2 className="text-sm font-semibold uppercase text-gray-600 tracking-wide">Description</h2>
          <p className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mb-6">
          {/* Submitted Details */}
          <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold uppercase text-gray-600 tracking-wide mb-4">Submitted Details</h3>
            <div className="space-y-3">
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-600">Submitted By</p>
                <p className="mt-1 font-medium text-gray-900">{complaint.user_name}</p>
              </div>
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-600">Email Address</p>
                <p className="mt-1 font-medium text-gray-900">{complaint.user_email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Submitted At</p>
                <p className="mt-1 font-medium text-gray-900">
                  {formatDateTime(complaint.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Details */}
          <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold uppercase text-gray-600 tracking-wide mb-4">Status Information</h3>
            <div className="space-y-3">
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-600">Current Status</p>
                <p className={`mt-1 font-medium ${getStatusBadgeClass(complaint.status)}`}>
                  {formatStatus(complaint.status)}
                </p>
              </div>
              <div className="border-b border-gray-100 pb-3">
                <p className="text-xs text-gray-600">Department</p>
                <p className="mt-1 font-medium text-gray-900">{complaint.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Last Updated At</p>
                <p className="mt-1 font-medium text-gray-900">
                  {formatDateTime(complaint.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="rounded-lg bg-white p-6 border border-gray-200 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-gray-600 tracking-wide mb-6">Complaint Timeline</h2>
          <ComplaintTimeline complaint={complaint} />
        </div>
      </div>
    </div>
  );
}
