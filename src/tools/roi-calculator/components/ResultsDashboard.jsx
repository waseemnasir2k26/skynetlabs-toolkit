import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend,
} from 'recharts'
import AnimatedNumber from './AnimatedNumber'
import { formatCurrency, formatNumber, generateReportText } from '../utils/calculations'

const CHART_COLORS = ['#13b973', '#3dd68a', '#6edfa6', '#9de9c2', '#c5f2db']

function StatCard({ label, value, prefix, suffix, icon, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`glass rounded-2xl p-5 sm:p-6 gradient-border transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs sm:text-sm text-gray-400 font-medium uppercase tracking-wider">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <AnimatedNumber
        value={value}
        prefix={prefix}
        suffix={suffix}
        className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white block"
        duration={1800}
      />
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-lg p-3 text-sm">
      <p className="text-gray-400 font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-semibold">
          {entry.name}: {typeof entry.value === 'number' ? `$${entry.value.toLocaleString()}` : entry.value}
        </p>
      ))}
    </div>
  )
}

export default function ResultsDashboard({ results, businessInfo, onBack, onReset }) {
  const [activeTab, setActiveTab] = useState('overview')

  // Prepare chart data
  const beforeAfterData = [
    {
      name: 'Annual Hours',
      Before: results.totalAnnualHours,
      After: results.totalAnnualHours - results.totalHoursSaved,
    },
    {
      name: 'Annual Cost',
      Before: results.totalAnnualCost,
      After: results.totalAnnualCost - results.totalCostSaved,
    },
  ]

  const taskChartData = results.taskBreakdown.map((t) => ({
    name: t.name.length > 20 ? t.name.substring(0, 18) + '...' : t.name,
    'Current Cost': t.annualCost,
    Savings: t.costSaved,
    'After Automation': t.automatedCost,
  }))

  const pieData = results.taskBreakdown.map((t) => ({
    name: t.name.length > 18 ? t.name.substring(0, 16) + '...' : t.name,
    value: t.costSaved,
  }))

  const handleDownload = () => {
    const text = generateReportText(results, businessInfo)
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AI-ROI-Report-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'breakdown', label: 'Task Breakdown' },
    { id: 'projection', label: 'Projection' },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto px-4 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <span className="text-xs font-medium text-primary-400">Analysis Complete</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          Your AI Automation ROI
        </h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Here is how much your business could save with AI automation
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Annual Time Saved"
          value={results.totalHoursSaved}
          suffix=" hrs"
          icon="⏱"
          delay={100}
        />
        <StatCard
          label="Annual Cost Savings"
          value={results.totalCostSaved}
          prefix="$"
          icon="💰"
          delay={250}
        />
        <StatCard
          label="ROI"
          value={results.roiPercent}
          suffix="%"
          icon="📈"
          delay={400}
        />
        <StatCard
          label="Payback Period"
          value={Math.round(results.paybackMonths * 10) / 10}
          suffix=" mo"
          icon="🔄"
          delay={550}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Hours Freed / Week</p>
          <p className="text-xl font-bold text-primary-400">{results.hoursSavedPerWeek}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Work Days Freed / Year</p>
          <p className="text-xl font-bold text-primary-400">{results.daysFreedPerYear}</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Net Year 1 Savings</p>
          <p className={`text-xl font-bold ${results.netSavingsYear1 >= 0 ? 'text-primary-400' : 'text-red-400'}`}>
            {formatCurrency(results.netSavingsYear1)}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">5-Year Total Savings</p>
          <p className="text-xl font-bold text-primary-400">{formatCurrency(results.fiveYearSavings)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Before vs After Bar Chart */}
          <div className="glass rounded-2xl p-5 sm:p-6 gradient-border">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Before vs After Automation</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={beforeAfterData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252530" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                <Bar dataKey="Before" fill="#4b5563" radius={[6, 6, 0, 0]} />
                <Bar dataKey="After" fill="#13b973" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Savings Distribution Pie */}
          <div className="glass rounded-2xl p-5 sm:p-6 gradient-border">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Savings by Task</h3>
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
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
                  formatter={(val) => <span className="text-gray-400">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'breakdown' && (
        <div className="mb-8 space-y-6">
          {/* Task breakdown chart */}
          <div className="glass rounded-2xl p-5 sm:p-6 gradient-border">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Cost Breakdown by Task</h3>
            <ResponsiveContainer width="100%" height={Math.max(300, results.taskBreakdown.length * 60)}>
              <BarChart data={taskChartData} layout="vertical" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#252530" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                <Bar dataKey="After Automation" stackId="a" fill="#4b5563" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Savings" stackId="a" fill="#13b973" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.taskBreakdown.map((task, i) => (
              <div key={task.id || i} className="glass rounded-xl p-4 gradient-border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-white truncate mr-2">{task.name}</h4>
                  <span className="text-xs text-primary-400 font-mono whitespace-nowrap">
                    {formatCurrency(task.costSaved)}/yr
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Hours saved / year</span>
                    <span className="text-gray-300">{formatNumber(task.hoursSaved)} hrs</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Current annual cost</span>
                    <span className="text-gray-300">{formatCurrency(task.annualCost)}</span>
                  </div>
                  <div className="w-full h-2 bg-dark-400 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-1000"
                      style={{ width: `${(task.costSaved / task.annualCost) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 text-right">
                    {Math.round((task.costSaved / task.annualCost) * 100)}% automated
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'projection' && (
        <div className="mb-8">
          <div className="glass rounded-2xl p-5 sm:p-6 gradient-border">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">24-Month Cumulative Savings Projection</h3>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={results.monthlyProjection}>
                <defs>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#13b973" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#13b973" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252530" />
                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} interval={2} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#13b973"
                  strokeWidth={2}
                  fill="url(#savingsGradient)"
                  name="Cumulative Savings"
                />
                <Line
                  type="monotone"
                  dataKey={() => 0}
                  stroke="#4b5563"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  name="Break Even"
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Break-even point reached at approximately month {Math.ceil(results.paybackMonths)}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="glass rounded-2xl p-6 sm:p-8 gradient-border mb-8">
        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Ready to save {formatCurrency(results.totalCostSaved)} per year?
          </h3>
          <p className="text-gray-400 text-sm">
            Let our AI automation experts build a custom solution for your business
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://www.skynetjoe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm bg-primary-500 text-dark hover:bg-primary-400 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 text-center glow"
          >
            Book a Free Consultation
            <svg className="inline-block ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm border border-primary-500/30 text-primary-400 hover:bg-primary-500/10 transition-all duration-300 text-center"
          >
            <svg className="inline-block mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mb-12">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-medium text-sm text-gray-400 hover:text-white border border-dark-400 hover:border-gray-500 transition-all duration-300"
        >
          <svg className="inline-block mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Adjust Settings
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-xl font-medium text-sm text-gray-400 hover:text-white border border-dark-400 hover:border-gray-500 transition-all duration-300"
        >
          Start Over
          <svg className="inline-block ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  )
}
