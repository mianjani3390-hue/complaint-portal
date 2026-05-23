/**
 * Calculate days between two dates
 */
export function calculateDaysDifference(fromDate, toDate = new Date()) {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const diffTime = Math.abs(to - from);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format date to readable string (e.g., "Jan 15, 2024")
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format date and time (e.g., "Jan 15, 2024 at 2:30 PM")
 */
export function formatDateTime(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get status badge styling
 */
export function getStatusBadgeClass(status) {
  const statusStyles = {
    new: 'bg-blue-100 text-blue-800 border border-blue-300',
    pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    in_progress: 'bg-purple-100 text-purple-800 border border-purple-300',
    resolved: 'bg-green-100 text-green-800 border border-green-300',
  };

  return statusStyles[status] || statusStyles.new;
}

/**
 * Format status text (e.g., "in_progress" → "In Progress")
 */
export function formatStatus(status) {
  const statusMap = {
    new: 'New',
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };

  return statusMap[status] || status;
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(isoDate) {
  if (!isoDate) return '—';

  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;

  return formatDate(isoDate);
}

/**
 * Estimate days to resolve (mock implementation)
 * In a real app, this would come from your SLA rules
 */
export function getEstimatedDaysToResolve(department = 'General', status = 'pending') {
  const slaMap = {
    'Water Department': 7,
    'Electricity': 5,
    'Roads': 14,
    'Sanitation': 10,
    'Education': 21,
    'Health': 5,
    'General': 10,
  };

  return slaMap[department] || 10;
}

/**
 * Get timeline steps based on status
 */
export function getTimelineSteps(complaint) {
  const steps = [
    {
      status: 'new',
      label: 'Submitted',
      date: complaint.created_at,
      completed: true,
    },
    {
      status: 'pending',
      label: 'Pending Review',
      date: null,
      completed: complaint.status === 'in_progress' || complaint.status === 'resolved',
    },
    {
      status: 'in_progress',
      label: 'In Progress',
      date: null,
      completed: complaint.status === 'resolved',
    },
    {
      status: 'resolved',
      label: 'Resolved',
      date: complaint.status === 'resolved' ? complaint.updated_at : null,
      completed: complaint.status === 'resolved',
    },
  ];

  return steps;
}

/**
 * Get days pending or estimated days to resolve
 */
export function getDaysInfo(complaint) {
  if (complaint.status === 'resolved') {
    const daysTaken = calculateDaysDifference(complaint.created_at, complaint.updated_at);
    return {
      type: 'resolved',
      days: daysTaken,
      label: `Resolved in ${daysTaken} day${daysTaken !== 1 ? 's' : ''}`,
    };
  }

  if (complaint.status === 'pending' || complaint.status === 'in_progress' || complaint.status === 'new') {
    const daysPending = calculateDaysDifference(complaint.created_at);
    const estimatedDays = getEstimatedDaysToResolve(complaint.department, complaint.status);
    const remainingDays = Math.max(0, estimatedDays - daysPending);

    return {
      type: 'pending',
      days: daysPending,
      estimated: estimatedDays,
      remaining: remainingDays,
      label: `Pending for ${daysPending} day${daysPending !== 1 ? 's' : ''}`,
      estimatedLabel: `Est. ${remainingDays} day${remainingDays !== 1 ? 's' : ''} remaining`,
    };
  }

  return {
    type: 'unknown',
    days: 0,
    label: 'Unknown',
  };
}
