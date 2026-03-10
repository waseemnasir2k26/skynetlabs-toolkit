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
    <div className="bg-dark-700 border border-dark-400 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
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
        <h1 className="text-2xl font-bold text-gray-100">Analytics</h1>
        <p className="text-gray-500 mt-0.5">{project.projectName} &middot; {project.clientName}</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stat-card">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Original Value</span>
          <span className="text-xl font-bold text-gray-100">{formatCurrency(stats.originalValue)}</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Current Value</span>
          <span className="text-xl font-bold text-primary">{formatCurrency(stats.currentValue)}</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Additional Cost</span>
          <span className="text-xl font-bold" style={{ color: getCreepColor(stats.creepPercentage) }}>
            +{formatCurrency(stats.additionalCost)}
          </span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Extra Hours</span>
          <span className="text-xl font-bold text-gray-100">+{stats.additionalHours}h</span>
        </div>
        <div className="stat-card">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Timeline Impact</span>
          <span className="text-xl font-bold text-orange-400">+{stats.timelineImpact} days</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge */}
        <div className="card flex flex-col items-center justify-center gap-4">
          <ScopeGauge percentage={stats.creepPercentage} size={180} />
          {stats.creepPercentage > 20 && (
            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
              <span className="text-sm text-red-400 font-medium">
                DANGER ZONE: {stats.creepPercentage.toFixed(1)}% scope creep
              </span>
            </div>
          )}
        </div>

        {/* Timeline comparison */}
        <div className="card lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Timeline Impact
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Original Timeline</span>
                <span className="text-gray-200">{formatDate(project.deadline)}</span>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-4">
                <div className="h-4 rounded-full bg-primary/40" style={{ width: '100%' }} />
              </div>
            </div>
            {projectedDeadline && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Projected Timeline</span>
                  <span className="text-orange-400">{formatDate(projectedDeadline)}</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-4">
                  <div
                    className="h-4 rounded-full bg-orange-500/40"
                    style={{
                      width: `${100 + (stats.timelineImpact / (project.startDate && project.deadline ? Math.max(1, Math.ceil((new Date(project.deadline) - new Date(project.startDate)) / 86400000)) : 30)) * 100}%`,
                      maxWidth: '100%',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary comparison */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-dark-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-200">
                {stats.originalHours}h
              </div>
              <div className="text-xs text-gray-500 mt-1">Original Hours</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.originalHours + stats.additionalHours}h
              </div>
              <div className="text-xs text-gray-500 mt-1">Current Total Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="card space-y-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Scope Changes Over Time
          </h3>
          {barData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
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
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Changes by Category
          </h3>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
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
