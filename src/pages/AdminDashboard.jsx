import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAdminToken, clearAdminToken } from '../lib/adminAuth'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const RANGES = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '90d', label: '90 Days' },
]

const PIE_COLORS = ['#00e5a0', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#10b981', '#6366f1']

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('7d')
  const navigate = useNavigate()
  const token = getAdminToken()

  useEffect(() => {
    if (!token) {
      navigate('/admin')
      return
    }

    setLoading(true)
    fetch(`/api/analytics?range=${range}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.status === 401) { clearAdminToken(); navigate('/admin'); return null }
        return r.json()
      })
      .then(d => { if (d) setData(d) })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [range, token, navigate])

  const handleLogout = () => {
    clearAdminToken()
    navigate('/admin')
  }

  const categoryData = useMemo(() => {
    if (!data?.topTools) return []
    const categories = {}
    data.topTools.forEach(t => {
      const cat = getCategoryForSlug(t.slug)
      categories[cat] = (categories[cat] || 0) + t.count
    })
    return Object.entries(categories).map(([name, value]) => ({ name, value }))
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '4px solid var(--border)', borderTopColor: 'var(--accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded-lg" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>Analytics Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>SkynetLabs Toolkit Usage</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {RANGES.map(r => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className="px-4 py-2 text-sm font-medium transition-all"
                style={range === r.key
                  ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
                  : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }
                }
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} className="px-4 py-2 text-sm rounded-xl transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            Logout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Visitors" value={data.totalVisitors?.toLocaleString() || '0'} sub={`${range} period`} />
        <StatCard label="Page Views" value={data.pageViews?.toLocaleString() || '0'} sub="All pages" />
        <StatCard label="Tool Uses" value={data.toolUses?.toLocaleString() || '0'} sub="Actions tracked" />
        <StatCard label="Top Tool" value={data.topTool || 'N/A'} sub={data.topTools?.[0] ? `${data.topTools[0].count} views` : ''} />
      </div>

      {/* Views Over Time */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>Views Over Time</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeline || []}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-heading)' }} />
              <Area type="monotone" dataKey="count" stroke="var(--accent)" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns: Tool Popularity + Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tool Popularity */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>Tool Popularity</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data.topTools || []).slice(0, 10)} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis type="category" dataKey="slug" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-heading)' }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>Category Breakdown</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-heading)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Countries + Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Countries */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>Top Countries</h2>
          <div className="space-y-2">
            {(data.countries || []).map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                <span className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>{c.country}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{c.count}</span>
              </div>
            ))}
            {(!data.countries || data.countries.length === 0) && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No data yet</p>
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>Device Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Desktop', value: data.devices?.desktop || 0, icon: '🖥️' },
              { label: 'Mobile', value: data.devices?.mobile || 0, icon: '📱' },
              { label: 'Tablet', value: data.devices?.tablet || 0, icon: '📋' },
            ].map(d => {
              const total = (data.devices?.desktop || 0) + (data.devices?.mobile || 0) + (data.devices?.tablet || 0)
              const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0'
              return (
                <div key={d.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl mb-2">{d.icon}</div>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{d.value}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.label} ({pct}%)</p>
                </div>
              )
            })}
          </div>

          {/* Event Types */}
          <h3 className="text-sm font-semibold mt-6 mb-3" style={{ color: 'var(--text-heading)' }}>Event Types</h3>
          <div className="space-y-2">
            {Object.entries(data.eventTypes || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
                <span className="text-sm" style={{ color: 'var(--text-body)' }}>{type}</span>
                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getCategoryForSlug(slug) {
  const map = {
    'proposal-builder': 'Generator',
    'project-tracker': 'Agency Operations',
    'client-onboarding': 'Agency Operations',
    'brief-analyzer': 'AI Intelligence',
    'sow-generator': 'AI Intelligence',
    'meeting-manager': 'AI Intelligence',
    'subject-line-tester': 'Ad Creative & Marketing',
    'email-templates': 'Ad Creative & Marketing',
    'cold-outreach': 'Ad Creative & Marketing',
    'onboarding-portal': 'Agency Operations',
    'client-report': 'Agency Operations',
    'fiverr-gig-creator': 'Freelancer Tools',
    'contract-generator': 'Generator',
    'brand-kit-generator': 'Generator',
    'content-planner': 'Authority Building',
    'social-proof-manager': 'Authority Building',
    'business-scorecard': 'Authority Building',
    'website-audit': 'Authority Building',
    'lead-magnet-factory': 'Authority Building',
    'feedback-survey': 'Authority Building',
    'social-calendar': 'Authority Building',
    'case-study-generator': 'Authority Building',
  }
  return map[slug] || 'Other'
}
