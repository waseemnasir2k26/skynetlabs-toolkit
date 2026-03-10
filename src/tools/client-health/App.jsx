import { useState } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'

const SERVICE_TYPES = ['Web Development', 'Design', 'Marketing', 'Automation', 'Consulting', 'Retainer', 'Other']
const RESPONSE_TIMES = ['Fast', 'Normal', 'Slow', 'Ghosting']
const PAYMENT_SPEEDS = ['Early', 'On-time', 'Late', 'Very late']
const SCOPE_CHANGES = ['0', '1', '2', '3+']
const SATISFACTION_SIGNALS = ['Positive', 'Neutral', 'Negative', 'Unknown']

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function calculateHealthScore(updates) {
  if (!updates || updates.length === 0) return { score: 50, label: 'No Data', color: 'gray' }

  const latest = updates[updates.length - 1]

  let score = 50

  // Response time
  const responseScores = { Fast: 20, Normal: 10, Slow: -5, Ghosting: -20 }
  score += responseScores[latest.responseTime] || 0

  // Payment speed
  const paymentScores = { Early: 15, 'On-time': 10, Late: -10, 'Very late': -25 }
  score += paymentScores[latest.paymentSpeed] || 0

  // Scope changes
  const scopeScores = { '0': 10, '1': 0, '2': -10, '3+': -20 }
  score += scopeScores[latest.scopeChanges] || 0

  // Satisfaction
  const satScores = { Positive: 20, Neutral: 5, Negative: -15, Unknown: -5 }
  score += satScores[latest.satisfaction] || 0

  // Referral
  if (latest.referral === 'Yes') score += 10

  // Trend bonus/penalty from history
  if (updates.length >= 2) {
    const prev = updates[updates.length - 2]
    const prevResponseScore = responseScores[prev.responseTime] || 0
    const currResponseScore = responseScores[latest.responseTime] || 0
    if (currResponseScore > prevResponseScore) score += 3
    if (currResponseScore < prevResponseScore) score -= 3
  }

  score = Math.max(0, Math.min(100, score))

  let label, color
  if (score >= 75) { label = 'Healthy'; color = 'green' }
  else if (score >= 50) { label = 'Moderate'; color = 'yellow' }
  else { label = 'At Risk'; color = 'red' }

  return { score, label, color }
}

function getTrend(updates) {
  if (!updates || updates.length < 2) return 'neutral'
  const scores = updates.map((_, i) => {
    const slice = updates.slice(0, i + 1)
    return calculateHealthScore(slice).score
  })
  const last = scores[scores.length - 1]
  const prev = scores[scores.length - 2]
  if (last > prev + 3) return 'up'
  if (last < prev - 3) return 'down'
  return 'neutral'
}

function monthsSince(dateStr) {
  const start = new Date(dateStr)
  const now = new Date()
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  return Math.max(0, months)
}

function formatCurrency(num) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num)
}

function TrendArrow({ trend }) {
  if (trend === 'up') return <span className="text-lg" style={{ color: 'var(--success)' }} title="Improving">&#9650;</span>
  if (trend === 'down') return <span className="text-lg" style={{ color: 'var(--danger)' }} title="Declining">&#9660;</span>
  return <span className="text-lg" style={{ color: 'var(--text-muted)' }} title="Stable">&#9654;</span>
}

function HealthBadge({ score, label, color }) {
  const colorStyles = {
    green: { background: 'var(--success-soft)', color: 'var(--success)', border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)' },
    yellow: { background: 'var(--warning-soft)', color: 'var(--warning)', border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)' },
    red: { background: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)' },
    gray: { background: 'color-mix(in srgb, var(--text-muted) 20%, transparent)', color: 'var(--text-muted)', border: '1px solid color-mix(in srgb, var(--text-muted) 30%, transparent)' },
  }
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold" style={colorStyles[color]}>
      <span className="text-lg">{score}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

function AddClientModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [revenue, setRevenue] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [serviceType, setServiceType] = useState('Web Development')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !revenue) return
    onAdd({
      id: generateId(),
      name: name.trim(),
      monthlyRevenue: parseFloat(revenue) || 0,
      startDate,
      serviceType,
      updates: [],
    })
    onClose()
  }

  const inputClass = 'w-full rounded-lg px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-1 transition text-sm'
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)', '--tw-ring-color': 'var(--accent-soft)' }
  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: 'var(--text-body)' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-xl p-6 w-full max-w-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-heading)' }}>Add New Client</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Client Name *</label>
            <input type="text" className={inputClass} style={inputStyle} placeholder="e.g., Acme Corp" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Monthly Revenue ($) *</label>
            <input type="number" className={inputClass} style={inputStyle} placeholder="e.g., 3000" min="0" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Start Date</label>
            <input type="date" className={inputClass} style={inputStyle} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Service Type</label>
            <select className={inputClass} style={inputStyle} value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={!name.trim() || !revenue} className="flex-1 py-2.5 font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
              Add Client
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg transition" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UpdateModal({ client, onClose, onSave }) {
  const [responseTime, setResponseTime] = useState('Normal')
  const [paymentSpeed, setPaymentSpeed] = useState('On-time')
  const [scopeChanges, setScopeChanges] = useState('0')
  const [satisfaction, setSatisfaction] = useState('Neutral')
  const [referral, setReferral] = useState('No')

  const handleSubmit = (e) => {
    e.preventDefault()
    const update = {
      id: generateId(),
      date: new Date().toISOString().slice(0, 10),
      responseTime,
      paymentSpeed,
      scopeChanges,
      satisfaction,
      referral,
    }
    onSave(client.id, update)
    onClose()
  }

  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: 'var(--text-body)' }
  const selectClass = 'w-full rounded-lg px-4 py-2.5 focus:outline-none transition text-sm'
  const selectStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-xl p-6 w-full max-w-md" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--text-heading)' }}>Monthly Update</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{client.name}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} style={labelStyle}>Response Time</label>
            <select className={selectClass} style={selectStyle} value={responseTime} onChange={(e) => setResponseTime(e.target.value)}>
              {RESPONSE_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Payment Speed</label>
            <select className={selectClass} style={selectStyle} value={paymentSpeed} onChange={(e) => setPaymentSpeed(e.target.value)}>
              {PAYMENT_SPEEDS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Scope Changes</label>
            <select className={selectClass} style={selectStyle} value={scopeChanges} onChange={(e) => setScopeChanges(e.target.value)}>
              {SCOPE_CHANGES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Satisfaction Signals</label>
            <select className={selectClass} style={selectStyle} value={satisfaction} onChange={(e) => setSatisfaction(e.target.value)}>
              {SATISFACTION_SIGNALS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Referral Given?</label>
            <select className={selectClass} style={selectStyle} value={referral} onChange={(e) => setReferral(e.target.value)}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 font-medium rounded-lg transition" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
              Save Update
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg transition" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ClientCard({ client, totalMRR, onUpdate, onDelete }) {
  const health = calculateHealthScore(client.updates)
  const trend = getTrend(client.updates)
  const months = monthsSince(client.startDate)
  const revenuePercent = totalMRR > 0 ? Math.round((client.monthlyRevenue / totalMRR) * 100) : 0

  return (
    <div className="rounded-xl p-5 transition" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold" style={{ color: 'var(--text-heading)' }}>{client.name}</h4>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{client.serviceType}</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendArrow trend={trend} />
          <HealthBadge score={health.score} label={health.label} color={health.color} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg p-2.5 text-center" style={{ background: 'var(--bg-card)' }}>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Revenue</p>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>{formatCurrency(client.monthlyRevenue)}<span className="text-xs" style={{ color: 'var(--text-muted)' }}>/mo</span></p>
        </div>
        <div className="rounded-lg p-2.5 text-center" style={{ background: 'var(--bg-card)' }}>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Revenue %</p>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>{revenuePercent}%</p>
        </div>
        <div className="rounded-lg p-2.5 text-center" style={{ background: 'var(--bg-card)' }}>
          <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Months</p>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>{months}</p>
        </div>
      </div>

      {client.updates.length > 0 && (
        <div className="mb-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          Last update: {client.updates[client.updates.length - 1].date}
          {' | '}
          {client.updates.length} update(s)
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onUpdate(client)}
          className="flex-1 py-2 text-sm font-medium rounded-lg transition"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
        >
          Add Update
        </button>
        <button
          onClick={() => {
            if (confirm(`Remove ${client.name}?`)) onDelete(client.id)
          }}
          className="px-3 py-2 text-sm rounded-lg transition"
          style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}
          title="Remove client"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [clients, setClients] = useLocalStorage('skynet-client-health', [])
  const [showAddModal, setShowAddModal] = useState(false)
  const [updateClient, setUpdateClient] = useState(null)

  const addClient = (client) => {
    setClients((prev) => [...prev, client])
  }

  const deleteClient = (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  const saveUpdate = (clientId, update) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId ? { ...c, updates: [...c.updates, update] } : c
      )
    )
  }

  // Dashboard stats
  const totalMRR = clients.reduce((sum, c) => sum + c.monthlyRevenue, 0)
  const healthScores = clients.map((c) => calculateHealthScore(c.updates))
  const avgHealth = clients.length > 0 ? Math.round(healthScores.reduce((sum, h) => sum + h.score, 0) / clients.length) : 0
  const atRiskCount = healthScores.filter((h) => h.color === 'red').length
  const maxRevPercent = clients.length > 0
    ? Math.round((Math.max(...clients.map((c) => c.monthlyRevenue)) / totalMRR) * 100)
    : 0

  return (
    <ToolLayout
      title="AI Client Health Dashboard"
      description="Track client relationships, monitor health scores, and identify at-risk accounts before problems escalate."
    >
      {/* Dashboard Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <ResultCard>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total MRR</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>{formatCurrency(totalMRR)}</p>
        </ResultCard>
        <ResultCard>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Avg Health</p>
          <p className="text-2xl font-bold" style={{ color: avgHealth >= 75 ? 'var(--success)' : avgHealth >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
            {avgHealth || '--'}
          </p>
        </ResultCard>
        <ResultCard>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>At-Risk Clients</p>
          <p className="text-2xl font-bold" style={{ color: atRiskCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {atRiskCount}
          </p>
        </ResultCard>
        <ResultCard>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Revenue Concentration</p>
          <p className="text-2xl font-bold" style={{ color: maxRevPercent > 50 ? 'var(--warning)' : 'var(--text-heading)' }}>
            {clients.length > 0 ? `${maxRevPercent}%` : '--'}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Largest client</p>
        </ResultCard>
      </div>

      {/* Add Client Button */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {clients.length} client{clients.length !== 1 ? 's' : ''} tracked
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      {/* Client Grid */}
      {clients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              totalMRR={totalMRR}
              onUpdate={setUpdateClient}
              onDelete={deleteClient}
            />
          ))}
        </div>
      ) : (
        <ResultCard>
          <div className="text-center py-12">
            <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>No clients yet</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Add your first client to start tracking health scores.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg transition text-sm font-medium"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              Add Your First Client
            </button>
          </div>
        </ResultCard>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddClientModal onClose={() => setShowAddModal(false)} onAdd={addClient} />
      )}
      {updateClient && (
        <UpdateModal
          client={updateClient}
          onClose={() => setUpdateClient(null)}
          onSave={saveUpdate}
        />
      )}
    </ToolLayout>
  )
}
