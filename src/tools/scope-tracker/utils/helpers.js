export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function daysBetween(date1, date2) {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
}

export function addDays(dateStr, days) {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getCreepColor(percentage) {
  if (percentage <= 10) return '#13b973';
  if (percentage <= 20) return '#f59e0b';
  if (percentage <= 35) return '#f97316';
  return '#ef4444';
}

export function getCreepLabel(percentage) {
  if (percentage <= 10) return 'Healthy';
  if (percentage <= 20) return 'Caution';
  if (percentage <= 35) return 'Warning';
  return 'Critical';
}

export function getPriorityColor(priority) {
  const colors = {
    Low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    High: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    Critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  };
  return colors[priority] || colors.Low;
}

export function getStatusColor(status) {
  const colors = {
    'Not Started': 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    'In Progress': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Complete: 'text-primary bg-primary/10 border-primary/20',
    Pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Approved: 'text-primary bg-primary/10 border-primary/20',
    Rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
    Completed: 'text-primary bg-primary/10 border-primary/20',
  };
  return colors[status] || colors['Not Started'];
}

export function getCategoryColor(category) {
  const colors = {
    'New Feature': '#8b5cf6',
    Change: '#f59e0b',
    'Bug Fix': '#ef4444',
    'Additional Content': '#3b82f6',
    'Design Change': '#ec4899',
  };
  return colors[category] || '#6b7280';
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function calcProjectStats(project) {
  const originalHours = project.deliverables.reduce(
    (sum, d) => sum + (parseFloat(d.hours) || 0),
    0
  );
  const originalValue = project.deliverables.reduce(
    (sum, d) => sum + (parseFloat(d.hours) || 0) * (parseFloat(d.rate) || 0),
    0
  );

  const approvedRequests = project.changeRequests.filter(
    (r) => r.status === 'Approved' || r.status === 'Completed'
  );
  const pendingRequests = project.changeRequests.filter(
    (r) => r.status === 'Pending'
  );

  const additionalHours = project.changeRequests
    .filter((r) => r.status !== 'Rejected')
    .reduce((sum, r) => sum + (parseFloat(r.hours) || 0), 0);

  const rate =
    parseFloat(project.deliverables[0]?.rate) ||
    (originalHours > 0 ? parseFloat(project.contractValue) / originalHours : 100);

  const additionalCost = project.changeRequests
    .filter((r) => r.status !== 'Rejected')
    .reduce(
      (sum, r) =>
        sum + (parseFloat(r.hours) || 0) * rate,
      0
    );

  const timelineImpact = project.changeRequests
    .filter((r) => r.status !== 'Rejected')
    .reduce((sum, r) => sum + (parseFloat(r.timelineImpact) || 0), 0);

  const currentValue = originalValue + additionalCost;
  const creepPercentage =
    originalValue > 0
      ? ((additionalCost / originalValue) * 100)
      : 0;

  return {
    originalHours,
    originalValue,
    additionalHours,
    additionalCost,
    currentValue,
    creepPercentage,
    timelineImpact,
    approvedRequests: approvedRequests.length,
    pendingRequests: pendingRequests.length,
    totalRequests: project.changeRequests.length,
    rate,
  };
}
