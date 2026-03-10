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
  if (trend === 'up') return <span className="text-green-400 text-lg" title="Improving">&#9650;</span>
  if (trend === 'down') return <span className="text-red-400 text-lg" title="Declining">&#9660;</span>
  return <span className="text-gray-500 text-lg" title="Stable">&#9654;</span>
}

function HealthBadge({ score, label, color }) {
  const colorClasses = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${colorClasses[color]}`}>
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

  const inputClass = 'w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition text-sm'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-dark-100 border border-white/10 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-white font-bold text-lg mb-4">Add New Client</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Client Name *</label>
            <input type="text" className={inputClass} placeholder="e.g., Acme Corp" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className={labelClass}>Monthly Revenue ($) *</label>
            <input type="number" className={inputClass} placeholder="e.g., 3000" min="0" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Start Date</label>
            <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Service Type</label>
            <select className={inputClass} value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={!name.trim() || !revenue} className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
              Add Client
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-dark-200/50 border border-white/10 text-gray-400 hover:text-white rounded-lg transition">
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

  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'
  const selectClass = 'w-full bg-dark-200/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 transition text-sm'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-dark-100 border border-white/10 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-white font-bold text-lg mb-1">Monthly Update</h3>
        <p className="text-gray-400 text-sm mb-4">{client.name}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Response Time</label>
            <select className={selectClass} value={responseTime} onChange={(e) => setResponseTime(e.target.value)}>
              {RESPONSE_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Payment Speed</label>
            <select className={selectClass} value={paymentSpeed} onChange={(e) => setPaymentSpeed(e.target.value)}>
              {PAYMENT_SPEEDS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Scope Changes</label>
            <select className={selectClass} value={scopeChanges} onChange={(e) => setScopeChanges(e.target.value)}>
              {SCOPE_CHANGES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Satisfaction Signals</label>
            <select className={selectClass} value={satisfaction} onChange={(e) => setSatisfaction(e.target.value)}>
              {SATISFACTION_SIGNALS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Referral Given?</label>
            <select className={selectClass} value={referral} onChange={(e) => setReferral(e.target.value)}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition">
              Save Update
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-dark-200/50 border border-white/10 text-gray-400 hover:text-white rounded-lg transition">
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
    <div className="bg-dark-100/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-white font-semibold">{client.name}</h4>
          <p className="text-gray-500 text-xs">{client.serviceType}</p>
        </div>
        <div className="flex items-center gap-2">
          <TrendArrow trend={trend} />
          <HealthBadge score={health.score} label={health.label} color={health.color} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-dark-200/30 rounded-lg p-2.5 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Revenue</p>
          <p className="text-white font-semibold text-sm">{formatCurrency(client.monthlyRevenue)}<span className="text-gray-500 text-xs">/mo</span></p>
        </div>
        <div className="bg-dark-200/30 rounded-lg p-2.5 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Revenue %</p>
          <p className="text-white font-semibold text-sm">{revenuePercent}%</p>
        </div>
        <div className="bg-dark-200/30 rounded-lg p-2.5 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Months</p>
          <p className="text-white font-semibold text-sm">{months}</p>
        </div>
      </div>

      {client.updates.length > 0 && (
        <div className="mb-3 text-xs text-gray-500">
          Last update: {client.updates[client.updates.length - 1].date}
          {' | '}
          {client.updates.length} update(s)
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onUpdate(client)}
          className="flex-1 py-2 bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium rounded-lg transition"
        >
          Add Update
        </button>
        <button
          onClick={() => {
            if (confirm(`Remove ${client.name}?`)) onDelete(client.id)
          }}
          className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm rounded-lg transition"
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
          <p className="text-xs text-gray-500 mb-1">Total MRR</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalMRR)}</p>
        </ResultCard>
        <ResultCard>
          <p className="text-xs text-gray-500 mb-1">Avg Health</p>
          <p className={`text-2xl font-bold ${avgHealth >= 75 ? 'text-green-400' : avgHealth >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {avgHealth || '--'}
          </p>
        </ResultCard>
        <ResultCard>
          <p className="text-xs text-gray-500 mb-1">At-Risk Clients</p>
          <p className={`text-2xl font-bold ${atRiskCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {atRiskCount}
          </p>
        </ResultCard>
        <ResultCard>
          <p className="text-xs text-gray-500 mb-1">Revenue Concentration</p>
          <p className={`text-2xl font-bold ${maxRevPercent > 50 ? 'text-yellow-400' : 'text-white'}`}>
            {clients.length > 0 ? `${maxRevPercent}%` : '--'}
          </p>
          <p className="text-xs text-gray-600">Largest client</p>
        </ResultCard>
      </div>

      {/* Add Client Button */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-400 text-sm">
          {clients.length} client{clients.length !== 1 ? 's' : ''} tracked
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition"
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
            <p className="text-gray-500 text-lg mb-2">No clients yet</p>
            <p className="text-gray-600 text-sm mb-4">Add your first client to start tracking health scores.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition text-sm font-medium"
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
