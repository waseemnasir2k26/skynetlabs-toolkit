import { useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'
import { ShareButton } from '../shared/useShareableURL'
import { useToast } from '../shared/Toast'
import { generateId } from '../shared/utils'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6',
  '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
  '#e879f9', '#fb923c', '#22d3ee', '#a78bfa', '#fbbf24',
]

function MetricBox({ label, value, sub, highlight = false, danger = false }) {
  const bgStyle = danger
    ? { background: 'var(--danger-soft)', border: '1px solid var(--danger)' }
    : highlight
    ? { background: 'var(--accent-soft)', border: '1px solid var(--accent)' }
    : { background: 'var(--bg-elevated)', border: '1px solid var(--border)' }

  const valueColor = danger ? 'var(--danger)' : highlight ? 'var(--accent)' : 'var(--text-heading)'

  return (
    <div className="p-4 rounded-lg" style={bgStyle}>
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: valueColor }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default function App() {
  const [availableHours, setAvailableHours] = useLocalStorage('skynet-capacity-planner-hours', 40)
  const [clients, setClients] = useLocalStorage('skynet-capacity-planner-clients', [
    { id: generateId(), name: 'Acme Corp', hoursPerWeek: 10, color: COLORS[0] },
    { id: generateId(), name: 'TechStart Inc', hoursPerWeek: 8, color: COLORS[1] },
    { id: generateId(), name: 'GreenLeaf Co', hoursPerWeek: 6, color: COLORS[2] },
  ])
  const [revenuePerHour, setRevenuePerHour] = useLocalStorage('skynet-capacity-planner-rate', 150)
  const [newClientName, setNewClientName] = useLocalStorage('skynet-capacity-planner-newName', '')
  const [newClientHours, setNewClientHours] = useLocalStorage('skynet-capacity-planner-newHours', 8)
  const [avgNewClientHours, setAvgNewClientHours] = useLocalStorage('skynet-capacity-planner-avgHours', 8)
  const toast = useToast()

  const metrics = useMemo(() => {
    const totalUsed = clients.reduce((sum, c) => sum + c.hoursPerWeek, 0)
    const utilization = availableHours > 0 ? (totalUsed / availableHours) * 100 : 0
    const remaining = Math.max(0, availableHours - totalUsed)
    const additionalClients = avgNewClientHours > 0 ? Math.floor(remaining / avgNewClientHours) : 0
    const weeklyRevenue = totalUsed * revenuePerHour
    const monthlyRevenue = weeklyRevenue * 4.33
    const maxMonthlyRevenue = availableHours * revenuePerHour * 4.33
    const revenueCapacity = maxMonthlyRevenue - monthlyRevenue
    const isOverCapacity = totalUsed > availableHours
    const overflowHours = isOverCapacity ? totalUsed - availableHours : 0

    return {
      totalUsed,
      utilization: Math.min(utilization, 999),
      remaining,
      additionalClients,
      weeklyRevenue,
      monthlyRevenue,
      maxMonthlyRevenue,
      revenueCapacity,
      isOverCapacity,
      overflowHours,
    }
  }, [clients, availableHours, revenuePerHour, avgNewClientHours])

  const capacityColor = metrics.utilization > 90 ? 'var(--danger)' : metrics.utilization > 70 ? 'var(--warning, #f59e0b)' : 'var(--success)'
  const capacityBgColor = metrics.utilization > 90 ? 'var(--danger-soft)' : metrics.utilization > 70 ? 'rgba(245, 158, 11, 0.15)' : 'var(--success-soft)'

  const addClient = () => {
    if (!newClientName.trim()) {
      if (toast) toast('Please enter a client name', 'error')
      return
    }
    const color = COLORS[clients.length % COLORS.length]
    setClients(prev => [...prev, { id: generateId(), name: newClientName.trim(), hoursPerWeek: newClientHours, color }])
    setNewClientName('')
    setNewClientHours(8)
    if (toast) toast(`${newClientName.trim()} added!`, 'success')
  }

  const removeClient = (id) => {
    const client = clients.find(c => c.id === id)
    setClients(prev => prev.filter(c => c.id !== id))
    if (toast) toast(`${client?.name || 'Client'} removed`, 'info')
  }

  const updateClientHours = (id, hours) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, hoursPerWeek: Math.max(0, hours) } : c))
  }

  const updateClientName = (id, name) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }

  const scheduleGrid = useMemo(() => {
    const grid = DAYS.map(() => [])
    const sortedClients = [...clients].sort((a, b) => b.hoursPerWeek - a.hoursPerWeek)

    sortedClients.forEach(client => {
      const dailyHours = client.hoursPerWeek / 5
      if (dailyHours > 0) {
        DAYS.forEach((_, dayIdx) => {
          grid[dayIdx].push({
            name: client.name,
            hours: Math.round(dailyHours * 10) / 10,
            color: client.color,
          })
        })
      }
    })
    return grid
  }, [clients])

  const getShareURL = () => {
    const url = new URL(window.location.href)
    url.search = ''
    url.searchParams.set('h', availableHours)
    url.searchParams.set('r', revenuePerHour)
    return url.toString()
  }

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(isFinite(n) ? n : 0)

  return (
    <ToolLayout
      title="Client Capacity Planner"
      description="Track your workload, visualize capacity utilization, and plan for new client acquisition."
      category="Agency Operations"
    >
      <div id="capacity-planner-export">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings */}
          <ResultCard title="Capacity Settings" icon="&#9881;">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Available Hours per Week</label>
                <input
                  type="number"
                  value={availableHours}
                  onChange={e => setAvailableHours(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={168}
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Revenue per Hour ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number"
                    value={revenuePerHour}
                    onChange={e => setRevenuePerHour(Math.max(0, parseFloat(e.target.value) || 0))}
                    min={0}
                    step={10}
                    className="w-full rounded-lg py-2.5 text-sm focus:outline-none pl-7 pr-3"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>Avg New Client Hours/Week</label>
                <input
                  type="number"
                  value={avgNewClientHours}
                  onChange={e => setAvgNewClientHours(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Used to calculate how many more clients you can take on.
                </p>
              </div>
            </div>
          </ResultCard>

          {/* Capacity Visualization */}
          <ResultCard title="Capacity Overview" icon="&#128200;">
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>Utilization</span>
                  <span className="text-lg font-bold" style={{ color: capacityColor }}>
                    {metrics.utilization.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-6 rounded-full overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.min(metrics.utilization, 100)}%`,
                      background: capacityColor,
                      minWidth: metrics.utilization > 0 ? '2rem' : '0',
                    }}
                  >
                    {metrics.utilization > 15 && (
                      <span className="text-xs font-bold" style={{ color: '#fff' }}>
                        {metrics.totalUsed}h
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>0h</span>
                  <span>{availableHours}h available</span>
                </div>
              </div>

              {/* Stacked Bar */}
              {clients.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Hours Breakdown by Client</p>
                  <div className="flex h-8 rounded-lg overflow-hidden" style={{ background: 'var(--bg-input)' }}>
                    {clients.map(client => {
                      const pct = availableHours > 0 ? (client.hoursPerWeek / availableHours) * 100 : 0
                      return pct > 0 ? (
                        <div
                          key={client.id}
                          className="h-full flex items-center justify-center transition-all duration-300"
                          style={{ width: `${Math.min(pct, 100)}%`, background: client.color, minWidth: '4px' }}
                          title={`${client.name}: ${client.hoursPerWeek}h (${pct.toFixed(0)}%)`}
                        >
                          {pct > 8 && (
                            <span className="text-xs font-bold truncate px-1" style={{ color: '#fff' }}>
                              {client.name.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      ) : null
                    })}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {clients.map(client => (
                      <div key={client.id} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ background: client.color }} />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{client.name} ({client.hoursPerWeek}h)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning */}
              {metrics.isOverCapacity && (
                <div
                  className="rounded-lg p-3 flex items-start gap-2"
                  style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)' }}
                >
                  <span className="text-lg">&#9888;</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Over Capacity!</p>
                    <p className="text-xs" style={{ color: 'var(--text-body)' }}>
                      You are {metrics.overflowHours} hours over your weekly capacity. Consider offloading work or adjusting timelines.
                    </p>
                  </div>
                </div>
              )}

              {!metrics.isOverCapacity && (
                <div
                  className="rounded-lg p-3"
                  style={{ background: capacityBgColor, border: `1px solid ${capacityColor}` }}
                >
                  <p className="text-sm font-medium" style={{ color: capacityColor }}>
                    You can take on {metrics.additionalClients} more client{metrics.additionalClients !== 1 ? 's' : ''} at {avgNewClientHours} hours/week each
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {metrics.remaining} hours remaining per week
                  </p>
                </div>
              )}
            </div>
          </ResultCard>
        </div>

        {/* Clients List */}
        <div className="mt-6">
          <ResultCard title={`Current Clients (${clients.length})`} icon="&#128101;">
            <div className="space-y-3">
              {clients.map(client => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 rounded-lg p-3"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <div className="w-3 h-full min-h-[2rem] rounded-full" style={{ background: client.color }} />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={client.name}
                      onChange={e => updateClientName(client.id, e.target.value)}
                      className="bg-transparent text-sm font-medium focus:outline-none w-full"
                      style={{ color: 'var(--text-heading)' }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={client.hoursPerWeek}
                      onChange={e => updateClientHours(client.id, parseFloat(e.target.value) || 0)}
                      min={0}
                      step={1}
                      className="w-16 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>h/wk</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                      {fmt(client.hoursPerWeek * revenuePerHour * 4.33)}/mo
                    </span>
                    <button
                      onClick={() => removeClient(client.id)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: 'var(--danger)', background: 'var(--danger-soft)' }}
                      title="Remove client"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Client */}
              <div
                className="flex items-center gap-3 rounded-lg p-3"
                style={{ background: 'var(--bg-card)', border: '2px dashed var(--border)' }}
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    placeholder="New client name..."
                    className="w-full bg-transparent text-sm focus:outline-none"
                    style={{ color: 'var(--text-heading)' }}
                    onKeyDown={e => e.key === 'Enter' && addClient()}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newClientHours}
                    onChange={e => setNewClientHours(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className="w-16 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>h/wk</span>
                  <button
                    onClick={addClient}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </ResultCard>
        </div>

        {/* Revenue & Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <MetricBox label="Weekly Revenue" value={fmt(metrics.weeklyRevenue)} />
          <MetricBox
            label="Monthly Revenue"
            value={fmt(metrics.monthlyRevenue)}
            highlight
          />
          <MetricBox
            label="Revenue Capacity Left"
            value={fmt(metrics.revenueCapacity)}
            sub={`${fmt(metrics.maxMonthlyRevenue)} max/month`}
          />
          <MetricBox
            label="Utilization Rate"
            value={`${metrics.utilization.toFixed(0)}%`}
            danger={metrics.isOverCapacity}
            highlight={!metrics.isOverCapacity && metrics.utilization > 70}
          />
        </div>

        {/* Weekly Schedule Grid */}
        <div className="mt-6">
          <ResultCard title="Weekly Schedule Overview" icon="&#128197;">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-5 gap-2 min-w-[500px]">
                {DAYS.map((day, dayIdx) => (
                  <div key={day}>
                    <div
                      className="text-center py-2 rounded-t-lg text-sm font-semibold"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-heading)', border: '1px solid var(--border)', borderBottom: 'none' }}
                    >
                      {day}
                    </div>
                    <div
                      className="rounded-b-lg p-2 space-y-1.5 min-h-[120px]"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: 'none' }}
                    >
                      {scheduleGrid[dayIdx].map((slot, slotIdx) => (
                        <div
                          key={slotIdx}
                          className="rounded-md px-2 py-1.5 text-xs"
                          style={{ background: slot.color + '22', borderLeft: `3px solid ${slot.color}`, color: 'var(--text-body)' }}
                        >
                          <div className="font-medium truncate">{slot.name}</div>
                          <div style={{ color: 'var(--text-muted)' }}>{slot.hours}h</div>
                        </div>
                      ))}
                      {scheduleGrid[dayIdx].length === 0 && (
                        <div className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                          Free
                        </div>
                      )}
                      {/* Daily total */}
                      <div className="text-xs text-center pt-1 font-medium" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                        {scheduleGrid[dayIdx].reduce((s, sl) => s + sl.hours, 0).toFixed(1)}h / {(availableHours / 5).toFixed(1)}h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ResultCard>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <ExportButton elementId="capacity-planner-export" filename="capacity-plan.pdf" label="Export as PDF" />
        <ShareButton getShareURL={getShareURL} />
      </div>
    </ToolLayout>
  )
}
