import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import ScopeGauge from './ScopeGauge';
import {
  formatCurrency,
  formatDate,
  addDays,
  calcProjectStats,
  getCategoryColor,
  getCreepColor,
} from '../utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 shadow-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.name?.includes('Cost')
            ? formatCurrency(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function Analytics({ project }) {
  const stats = calcProjectStats(project);

  // Bar chart data: group changes by month
  const changesByMonth = {};
  project.changeRequests.forEach((r) => {
    const month = r.dateRequested?.substring(0, 7) || 'Unknown';
    if (!changesByMonth[month]) {
      changesByMonth[month] = { month, count: 0, hours: 0, cost: 0 };
    }
    changesByMonth[month].count += 1;
    changesByMonth[month].hours += parseFloat(r.hours) || 0;
    changesByMonth[month].cost +=
      (parseFloat(r.hours) || 0) * stats.rate;
  });
  const barData = Object.values(changesByMonth).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  // Pie chart data: by category
  const categoryMap = {};
  project.changeRequests.forEach((r) => {
    if (!categoryMap[r.category]) {
      categoryMap[r.category] = { name: r.category, value: 0, hours: 0 };
    }
    categoryMap[r.category].value += 1;
    categoryMap[r.category].hours += parseFloat(r.hours) || 0;
  });
  const pieData = Object.values(categoryMap);

  const projectedDeadline =
    project.deadline && stats.timelineImpact > 0
      ? addDays(project.deadline, stats.timelineImpact)
      : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>Analytics</h1>
        <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>{project.projectName} &middot; {project.clientName}</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stat-card">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Original Value</span>
          <span className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>{formatCurrency(stats.originalValue)}</span>
        </div>
        <div className="stat-card">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Current Value</span>
          <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{formatCurrency(stats.currentValue)}</span>
        </div>
        <div className="stat-card">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Additional Cost</span>
          <span className="text-xl font-bold" style={{ color: getCreepColor(stats.creepPercentage) }}>
            +{formatCurrency(stats.additionalCost)}
          </span>
        </div>
        <div className="stat-card">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Extra Hours</span>
          <span className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>+{stats.additionalHours}h</span>
        </div>
        <div className="stat-card">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Timeline Impact</span>
          <span className="text-xl font-bold" style={{ color: 'var(--warning)' }}>+{stats.timelineImpact} days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge */}
        <div className="card flex flex-col items-center justify-center gap-4">
          <ScopeGauge percentage={stats.creepPercentage} size={180} />
          {stats.creepPercentage > 20 && (
            <div className="w-full rounded-lg p-3 text-center" style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
                DANGER ZONE: {stats.creepPercentage.toFixed(1)}% scope creep
              </span>
            </div>
          )}
        </div>

        {/* Timeline comparison */}
        <div className="card lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Timeline Impact
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: 'var(--text-muted)' }}>Original Timeline</span>
                <span style={{ color: 'var(--text-body)' }}>{formatDate(project.deadline)}</span>
              </div>
              <div className="w-full rounded-full h-4" style={{ background: 'var(--bg-elevated)' }}>
                <div className="h-4 rounded-full" style={{ width: '100%', background: 'var(--accent-soft)' }} />
              </div>
            </div>
            {projectedDeadline && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>Projected Timeline</span>
                  <span style={{ color: 'var(--warning)' }}>{formatDate(projectedDeadline)}</span>
                </div>
                <div className="w-full rounded-full h-4" style={{ background: 'var(--bg-elevated)' }}>
                  <div
                    className="h-4 rounded-full"
                    style={{
                      width: `${100 + (stats.timelineImpact / (project.startDate && project.deadline ? Math.max(1, Math.ceil((new Date(project.deadline) - new Date(project.startDate)) / 86400000)) : 30)) * 100}%`,
                      maxWidth: '100%',
                      background: 'var(--warning)',
                      opacity: 0.4,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary comparison */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="rounded-lg p-4 text-center" style={{ background: 'var(--bg-elevated)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-body)' }}>
                {stats.originalHours}h
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Original Hours</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{ background: 'var(--bg-elevated)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                {stats.originalHours + stats.additionalHours}h
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Current Total Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Scope Changes Over Time
          </h3>
          {barData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No change requests yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222233" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                />
                <Bar dataKey="count" name="Requests" fill="#13b973" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hours" name="Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Changes by Category
          </h3>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No change requests yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={{ stroke: '#6b7280' }}
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={getCategoryColor(entry.name)}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
