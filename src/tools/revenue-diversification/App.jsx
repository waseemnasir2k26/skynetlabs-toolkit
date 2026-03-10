import { useState, useMemo, useRef } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ScoreGauge from '../shared/ScoreGauge'
import { useToast } from '../shared/Toast'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const SERVICE_TYPES = [
  'Web Development', 'Design', 'SEO', 'Social Media', 'Content Writing',
  'Consulting', 'Advertising', 'Email Marketing', 'Video Production', 'Other',
]

const COLORS = ['var(--accent)', 'var(--info)', 'var(--warning)', 'var(--danger)', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

const EMPTY_SOURCE = { clientName: '', monthlyRevenue: '', serviceType: SERVICE_TYPES[0] }

export default function App() {
  const [sources, setSources] = useState([{ ...EMPTY_SOURCE, id: Date.now() }])
  const [removedIds, setRemovedIds] = useState(new Set())
  const exportRef = useRef(null)
  const toast = useToast()

  const addSource = () => setSources((prev) => [...prev, { ...EMPTY_SOURCE, id: Date.now() }])
  const removeSource = (id) => setSources((prev) => prev.filter((s) => s.id !== id))
  const updateSource = (id, field, value) => {
    setSources((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s))
  }

  const validSources = useMemo(() => sources.filter((s) => s.clientName && Number(s.monthlyRevenue) > 0), [sources])
  const activeSources = useMemo(() => validSources.filter((s) => !removedIds.has(s.id)), [validSources, removedIds])

  const analysis = useMemo(() => {
    if (activeSources.length === 0) return null

    const totalRevenue = activeSources.reduce((sum, s) => sum + Math.max(0, parseFloat(s.monthlyRevenue) || 0), 0)
    if (totalRevenue === 0) return null
    const withPct = activeSources.map((s) => ({
      ...s,
      revenue: Math.max(0, parseFloat(s.monthlyRevenue) || 0),
      percentage: totalRevenue > 0 ? (Math.max(0, parseFloat(s.monthlyRevenue) || 0) / totalRevenue) * 100 : 0,
    })).sort((a, b) => b.revenue - a.revenue)

    const maxPct = Math.max(...withPct.map((s) => s.percentage))
    const top1Pct = withPct[0]?.percentage || 0
    const top2Pct = withPct.slice(0, 2).reduce((s, x) => s + x.percentage, 0)

    // HHI-based diversification score
    const hhi = withPct.reduce((sum, s) => sum + Math.pow(s.percentage / 100, 2), 0)
    const maxHhi = 1 // single source
    const minHhi = 1 / Math.max(activeSources.length, 1)
    const hhiDenom = maxHhi - minHhi
    const normalizedHhi = activeSources.length > 1 && hhiDenom > 0 ? (maxHhi - hhi) / hhiDenom : 0

    // Service type diversity bonus
    const uniqueServices = new Set(activeSources.map((s) => s.serviceType)).size
    const serviceDiversity = Math.min(uniqueServices / 4, 1) * 20

    const diversificationScore = Math.round(Math.min(normalizedHhi * 80 + serviceDiversity, 100))

    // Recommendations
    const recommendations = []
    if (top1Pct > 40) recommendations.push(`Your top client (${withPct[0].clientName}) accounts for ${top1Pct.toFixed(0)}% of revenue. Losing them would be devastating. Prioritize acquiring 2-3 new clients in the next 90 days.`)
    if (top2Pct > 70 && activeSources.length > 2) recommendations.push(`Your top 2 clients make up ${top2Pct.toFixed(0)}% of revenue. Aim to bring each below 30%.`)
    if (uniqueServices === 1) recommendations.push(`All revenue comes from ${activeSources[0].serviceType}. Consider adding a complementary service to reduce risk.`)
    if (activeSources.length < 5) recommendations.push(`You have only ${activeSources.length} revenue source(s). Aim for at least 5-8 active clients for stability.`)
    if (activeSources.length >= 5 && maxPct < 25) recommendations.push(`Good spread across clients. Focus on increasing average deal size to grow revenue without concentration risk.`)
    if (recommendations.length === 0) recommendations.push('Your revenue is well diversified. Maintain balance and focus on growing total revenue.')

    // By service type
    const byService = {}
    activeSources.forEach((s) => {
      byService[s.serviceType] = (byService[s.serviceType] || 0) + Number(s.monthlyRevenue)
    })
    const serviceData = Object.entries(byService).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

    return { totalRevenue, withPct, diversificationScore, recommendations, serviceData, maxPct, top1Pct, uniqueServices }
  }, [activeSources])

  // What-if: original total vs active total
  const originalTotal = useMemo(() => validSources.reduce((s, x) => s + Number(x.monthlyRevenue), 0), [validSources])
  const revenueGap = originalTotal - (analysis?.totalRevenue || 0)

  const toggleRemove = (id) => {
    setRemovedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleExportPDF = async () => {
    const el = exportRef.current
    if (!el) return
    const orig = { overflow: el.style.overflow, height: el.style.height, maxHeight: el.style.maxHeight }
    el.style.overflow = 'visible'
    el.style.height = 'auto'
    el.style.maxHeight = 'none'
    const root = document.documentElement
    const originalTheme = root.getAttribute('data-theme')
    root.setAttribute('data-theme', 'light')
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    try {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pw = pdf.internal.pageSize.getWidth()
      const ph = pdf.internal.pageSize.getHeight()
      const ratio = pw / canvas.width
      const totalH = canvas.height * ratio
      let pos = 0
      while (pos < totalH) {
        if (pos > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -pos, pw, totalH)
        pos += ph
      }
      pdf.save('revenue-diversification-report.pdf')
      if (toast) toast('Report exported as PDF!', 'success')
    } finally {
      root.setAttribute('data-theme', originalTheme || 'dark')
      el.style.overflow = orig.overflow
      el.style.height = orig.height
      el.style.maxHeight = orig.maxHeight
    }
  }

  const getRiskColor = (pct) => {
    if (pct <= 20) return 'var(--success)'
    if (pct <= 30) return 'var(--warning)'
    return 'var(--danger)'
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg px-3 py-2 text-sm" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
        <p className="font-medium" style={{ color: "var(--text-heading)" }}>{payload[0].name}</p>
        <p style={{ color: "var(--text-muted)" }}>${Number(payload[0].value).toLocaleString()}/mo ({analysis.totalRevenue > 0 ? ((payload[0].value / analysis.totalRevenue) * 100).toFixed(1) : '0.0'}%)</p>
      </div>
    )
  }

  return (
    <ToolLayout
      title="Revenue Diversification Analyzer"
      description="Assess concentration risk across your income sources and get actionable recommendations to diversify."
    >
      {/* Input Section */}
      <ResultCard title="Income Sources" icon="💰" className="mb-8">
        <div className="space-y-3 mb-4">
          {sources.map((source, idx) => (
            <div key={source.id} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_160px_40px] gap-3 items-end">
              <div>
                {idx === 0 && <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Client Name</label>}
                <input
                  type="text"
                  value={source.clientName}
                  onChange={(e) => updateSource(source.id, 'clientName', e.target.value)}
                  placeholder="Client name"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
                />
              </div>
              <div>
                {idx === 0 && <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Monthly $</label>}
                <input
                  type="number"
                  min="0"
                  value={source.monthlyRevenue}
                  onChange={(e) => updateSource(source.id, 'monthlyRevenue', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
                />
              </div>
              <div>
                {idx === 0 && <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Service Type</label>}
                <select
                  value={source.serviceType}
                  onChange={(e) => updateSource(source.id, 'serviceType', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
                >
                  {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                {idx === 0 && <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>&nbsp;</label>}
                <button
                  onClick={() => removeSource(source.id)}
                  className="w-full py-2 rounded-lg transition-colors text-lg" style={{ color: "var(--danger)" }}
                  title="Remove"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addSource}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors" style={{ color: "var(--accent)", border: "1px solid var(--accent-soft)" }}
        >
          + Add Income Source
        </button>
      </ResultCard>

      {analysis && (
        <div ref={exportRef}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Pie Chart */}
            <ResultCard title="Revenue Distribution" icon="📊" className="lg:col-span-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysis.withPct.map((s) => ({ name: s.clientName, value: s.revenue }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                    >
                      {analysis.withPct.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ResultCard>

            {/* Diversification Score */}
            <ResultCard title="Diversification Score" icon="🛡">
              <div className="flex flex-col items-center gap-4">
                <ScoreGauge
                  score={analysis.diversificationScore}
                  label={analysis.diversificationScore >= 70 ? 'Well Diversified' : analysis.diversificationScore >= 40 ? 'Moderate Risk' : 'High Risk'}
                />
                <div className="text-center space-y-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  <p>{activeSources.length} active source{activeSources.length !== 1 ? 's' : ''}</p>
                  <p>{analysis.uniqueServices} service type{analysis.uniqueServices !== 1 ? 's' : ''}</p>
                  <p className="font-semibold" style={{ color: "var(--text-heading)" }}>${analysis.totalRevenue.toLocaleString()}/mo total</p>
                </div>
              </div>
            </ResultCard>
          </div>

          {/* Concentration Risk Bars */}
          <ResultCard title="Client Concentration Risk" icon="⚠" className="mb-8">
            <div className="space-y-3">
              {analysis.withPct.map((s, i) => (
                <div key={s.id || i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "var(--text-body)" }}>{s.clientName}</span>
                    <span className="font-medium" style={{ color: getRiskColor(s.percentage) }}>
                      {s.percentage.toFixed(1)}% &middot; ${s.revenue.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(s.percentage, 100)}%`,
                        backgroundColor: getRiskColor(s.percentage),
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-4 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "var(--success)" }} /> Safe (&le;20%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "var(--warning)" }} /> Caution (20-30%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: "var(--danger)" }} /> High Risk (&gt;30%)</span>
              </div>
            </div>
          </ResultCard>

          {/* What-If Simulator */}
          <ResultCard title="&quot;What If&quot; Simulator" icon="🔀" className="mb-8">
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Toggle clients off to simulate losing them. See the impact on your revenue.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {validSources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleRemove(s.id)}
                  className="flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm"
                  style={
                    removedIds.has(s.id)
                      ? { border: '1px solid var(--danger-soft)', background: 'var(--danger-soft)', color: 'var(--danger)', textDecoration: 'line-through' }
                      : { border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-heading)' }
                  }
                >
                  <span>{s.clientName}</span>
                  <span className="font-medium">${Number(s.monthlyRevenue).toLocaleString()}</span>
                </button>
              ))}
            </div>
            {revenueGap > 0 && (
              <div className="rounded-lg p-4" style={{ background: "var(--danger-soft)", border: "1px solid var(--danger)" }}>
                <p className="font-semibold" style={{ color: "var(--danger)" }}>Revenue Gap: ${revenueGap.toLocaleString()}/mo (${(revenueGap * 12).toLocaleString()}/yr)</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  You would lose {originalTotal > 0 ? ((revenueGap / originalTotal) * 100).toFixed(0) : '0'}% of your revenue.
                  {originalTotal > 0 && revenueGap / originalTotal > 0.3 && ' This is a survival-level risk. Diversify urgently.'}
                  {originalTotal > 0 && revenueGap / originalTotal > 0.15 && revenueGap / originalTotal <= 0.3 && ' This is a significant risk. Start diversifying.'}
                </p>
              </div>
            )}
          </ResultCard>

          {/* Recommendations */}
          <ResultCard title="Recommendations" icon="💡" className="mb-8">
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--text-body)" }}>
                  <span className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }}>&#10003;</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </ResultCard>
        </div>
      )}

      {analysis && (
        <div className="flex justify-center">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Risk Assessment PDF
          </button>
        </div>
      )}
    </ToolLayout>
  )
}
