import React, { useState, useMemo } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { jsPDF } from 'jspdf'

const SERVICE_TYPES = [
  'Web Design', 'Web Development', 'Branding', 'SEO', 'Social Media',
  'Content Marketing', 'Email Marketing', 'PPC Ads', 'Video Production',
  'App Development', 'Consulting', 'Other'
]

const emptyForm = {
  projectName: '',
  clientName: '',
  serviceType: '',
  completionDate: '',
  originalBudget: '',
  actualBudget: '',
  originalTimeline: '',
  actualTimeline: '',
  wentWell: '',
  wentWrong: '',
  satisfaction: 0,
  workAgain: '',
  keyLesson: ''
}

function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange(s)}
          className={`text-2xl transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          style={{ color: s <= value ? 'var(--warning)' : 'var(--text-muted)' }}
        >
          &#9733;
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const [entries, setEntries] = useLocalStorage('skynet-post-mortems', [])
  const [form, setForm] = useState({ ...emptyForm })
  const [view, setView] = useState('form') // form | history | analysis
  const [search, setSearch] = useState('')
  const [filterService, setFilterService] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const updateField = (field, value) => setForm(p => ({ ...p, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.projectName || !form.clientName) return
    const entry = {
      ...form,
      id: editingId || crypto.randomUUID(),
      createdAt: editingId ? entries.find(x => x.id === editingId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      originalBudget: parseFloat(form.originalBudget) || 0,
      actualBudget: parseFloat(form.actualBudget) || 0,
      originalTimeline: parseInt(form.originalTimeline) || 0,
      actualTimeline: parseInt(form.actualTimeline) || 0,
    }
    if (editingId) {
      setEntries(prev => prev.map(x => x.id === editingId ? entry : x))
    } else {
      setEntries(prev => [entry, ...prev])
    }
    setForm({ ...emptyForm })
    setEditingId(null)
    setView('history')
  }

  const handleEdit = (entry) => {
    setForm({
      ...entry,
      originalBudget: String(entry.originalBudget),
      actualBudget: String(entry.actualBudget),
      originalTimeline: String(entry.originalTimeline),
      actualTimeline: String(entry.actualTimeline),
    })
    setEditingId(entry.id)
    setSelectedEntry(null)
    setView('form')
  }

  const handleDelete = (id) => {
    if (!confirm('Delete this post-mortem?')) return
    setEntries(prev => prev.filter(x => x.id !== id))
    if (selectedEntry?.id === id) setSelectedEntry(null)
  }

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchSearch = !search || e.projectName.toLowerCase().includes(search.toLowerCase()) || e.clientName.toLowerCase().includes(search.toLowerCase())
      const matchService = !filterService || e.serviceType === filterService
      return matchSearch && matchService
    })
  }, [entries, search, filterService])

  const analysis = useMemo(() => {
    if (entries.length < 3) return null
    const totalBudgetDiff = entries.reduce((s, e) => s + (e.actualBudget - e.originalBudget), 0)
    const budgetEntries = entries.filter(e => e.originalBudget > 0)
    const avgBudgetAccuracy = budgetEntries.length > 0
      ? entries.reduce((s, e) => {
          if (e.originalBudget === 0) return s
          return s + (e.actualBudget / e.originalBudget) * 100
        }, 0) / budgetEntries.length
      : 0

    const timelineEntries = entries.filter(e => e.originalTimeline > 0)
    const avgTimelineOverrun = timelineEntries.length > 0
      ? entries.reduce((s, e) => {
          if (e.originalTimeline === 0) return s
          return s + ((e.actualTimeline - e.originalTimeline) / e.originalTimeline) * 100
        }, 0) / timelineEntries.length
      : 0

    const serviceProfit = {}
    entries.forEach(e => {
      if (!serviceProfit[e.serviceType]) serviceProfit[e.serviceType] = { revenue: 0, count: 0 }
      serviceProfit[e.serviceType].revenue += e.actualBudget
      serviceProfit[e.serviceType].count += 1
    })
    const mostProfitable = Object.entries(serviceProfit).sort((a, b) => b[1].revenue - a[1].revenue)[0]

    const avgSatisfaction = entries.reduce((s, e) => s + (e.satisfaction || 0), 0) / entries.length

    const issueWords = {}
    entries.forEach(e => {
      if (e.wentWrong) {
        e.wentWrong.toLowerCase().split(/[\s,.\n]+/).filter(w => w.length > 4).forEach(w => {
          issueWords[w] = (issueWords[w] || 0) + 1
        })
      }
    })
    const commonIssues = Object.entries(issueWords).sort((a, b) => b[1] - a[1]).slice(0, 5)

    const workAgainStats = { Yes: 0, Maybe: 0, No: 0 }
    entries.forEach(e => { if (e.workAgain) workAgainStats[e.workAgain] = (workAgainStats[e.workAgain] || 0) + 1 })

    return {
      totalBudgetDiff,
      avgBudgetAccuracy: avgBudgetAccuracy.toFixed(1),
      avgTimelineOverrun: avgTimelineOverrun.toFixed(1),
      mostProfitable,
      avgSatisfaction: avgSatisfaction.toFixed(1),
      commonIssues,
      workAgainStats,
      totalProjects: entries.length
    }
  }, [entries])

  const exportPDF = (entry = null) => {
    const doc = new jsPDF()
    let y = 20
    const lm = 20
    const pw = 170

    doc.setFontSize(18)
    doc.setTextColor(19, 185, 115)
    if (entry) {
      doc.text(`Post-Mortem: ${entry.projectName}`, lm, y)
      y += 10
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text(`Client: ${entry.clientName} | Service: ${entry.serviceType}`, lm, y)
      y += 6
      doc.text(`Completed: ${entry.completionDate || 'N/A'}`, lm, y)
      y += 10

      doc.setFontSize(12)
      doc.setTextColor(40)
      doc.text('Budget', lm, y); y += 6
      doc.setFontSize(10)
      doc.text(`Original: $${entry.originalBudget.toLocaleString()} | Actual: $${entry.actualBudget.toLocaleString()}`, lm, y); y += 6
      const budgetDiff = entry.actualBudget - entry.originalBudget
      doc.text(`Difference: ${budgetDiff >= 0 ? '+' : ''}$${budgetDiff.toLocaleString()}`, lm, y); y += 10

      doc.setFontSize(12)
      doc.text('Timeline', lm, y); y += 6
      doc.setFontSize(10)
      doc.text(`Original: ${entry.originalTimeline} days | Actual: ${entry.actualTimeline} days`, lm, y); y += 10

      doc.setFontSize(12)
      doc.text('What Went Well', lm, y); y += 6
      doc.setFontSize(10)
      const wellLines = doc.splitTextToSize(entry.wentWell || 'N/A', pw)
      doc.text(wellLines, lm, y); y += wellLines.length * 5 + 6

      doc.setFontSize(12)
      doc.text('What Went Wrong', lm, y); y += 6
      doc.setFontSize(10)
      const wrongLines = doc.splitTextToSize(entry.wentWrong || 'N/A', pw)
      doc.text(wrongLines, lm, y); y += wrongLines.length * 5 + 6

      doc.setFontSize(12)
      doc.text(`Satisfaction: ${entry.satisfaction}/5 | Work Again: ${entry.workAgain || 'N/A'}`, lm, y); y += 10

      doc.setFontSize(12)
      doc.text('Key Lesson', lm, y); y += 6
      doc.setFontSize(10)
      const lessonLines = doc.splitTextToSize(entry.keyLesson || 'N/A', pw)
      doc.text(lessonLines, lm, y)

      doc.save(`post-mortem-${entry.projectName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
    } else {
      doc.text('Aggregate Post-Mortem Report', lm, y); y += 10
      doc.setFontSize(11)
      doc.setTextColor(80)
      doc.text(`Total Projects Analyzed: ${analysis.totalProjects}`, lm, y); y += 8
      doc.text(`Avg Budget Accuracy: ${analysis.avgBudgetAccuracy}%`, lm, y); y += 6
      doc.text(`Avg Timeline Overrun: ${analysis.avgTimelineOverrun}%`, lm, y); y += 6
      doc.text(`Avg Satisfaction: ${analysis.avgSatisfaction}/5`, lm, y); y += 6
      if (analysis.mostProfitable) {
        doc.text(`Most Profitable Service: ${analysis.mostProfitable[0]} ($${analysis.mostProfitable[1].revenue.toLocaleString()})`, lm, y); y += 10
      }
      doc.setFontSize(12)
      doc.setTextColor(40)
      doc.text('Work Again Stats', lm, y); y += 6
      doc.setFontSize(10)
      doc.setTextColor(80)
      Object.entries(analysis.workAgainStats).forEach(([k, v]) => {
        doc.text(`${k}: ${v}`, lm, y); y += 5
      })
      y += 5
      doc.setFontSize(12)
      doc.setTextColor(40)
      doc.text('Common Issue Keywords', lm, y); y += 6
      doc.setFontSize(10)
      doc.setTextColor(80)
      analysis.commonIssues.forEach(([word, count]) => {
        doc.text(`"${word}" (${count}x)`, lm, y); y += 5
      })

      doc.save('post-mortem-aggregate-report.pdf')
    }
  }

  const inputClass = 'w-full rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none transition-colors'
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }
  const btnPrimary = { background: 'var(--accent)', color: 'var(--text-heading)' }
  const btnSecondary = { background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '1px solid var(--border)' }

  return (
    <ToolLayout
      title="Project Post-Mortem Engine"
      description="Analyze past projects to identify patterns, improve estimates, and refine your process."
    >
      {/* Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'form', label: editingId ? 'Edit Post-Mortem' : 'New Post-Mortem' },
          { key: 'history', label: `History (${entries.length})` },
          { key: 'analysis', label: 'Pattern Analysis' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setView(tab.key); setSelectedEntry(null) }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={view === tab.key ? btnPrimary : { ...btnSecondary }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* New / Edit Form */}
      {view === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <ResultCard title={editingId ? 'Edit Post-Mortem' : 'New Post-Mortem'} icon="&#128221;">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Project Name *</label>
                <input className={inputClass} style={inputStyle} value={form.projectName} onChange={e => updateField('projectName', e.target.value)} placeholder="e.g. Website Redesign" required />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Client Name *</label>
                <input className={inputClass} style={inputStyle} value={form.clientName} onChange={e => updateField('clientName', e.target.value)} placeholder="e.g. Acme Corp" required />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Service Type</label>
                <select className={inputClass} style={inputStyle} value={form.serviceType} onChange={e => updateField('serviceType', e.target.value)}>
                  <option value="">Select...</option>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Completion Date</label>
                <input type="date" className={inputClass} style={inputStyle} value={form.completionDate} onChange={e => updateField('completionDate', e.target.value)} />
              </div>
            </div>
          </ResultCard>

          <ResultCard title="Budget & Timeline" icon="&#128176;">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Original Budget ($)</label>
                <input type="number" min="0" step="0.01" className={inputClass} style={inputStyle} value={form.originalBudget} onChange={e => updateField('originalBudget', e.target.value)} placeholder="5000" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Actual Budget ($)</label>
                <input type="number" min="0" step="0.01" className={inputClass} style={inputStyle} value={form.actualBudget} onChange={e => updateField('actualBudget', e.target.value)} placeholder="5500" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Original Timeline (days)</label>
                <input type="number" min="0" className={inputClass} style={inputStyle} value={form.originalTimeline} onChange={e => updateField('originalTimeline', e.target.value)} placeholder="30" />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Actual Timeline (days)</label>
                <input type="number" min="0" className={inputClass} style={inputStyle} value={form.actualTimeline} onChange={e => updateField('actualTimeline', e.target.value)} placeholder="38" />
              </div>
            </div>
          </ResultCard>

          <ResultCard title="Retrospective" icon="&#128269;">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>What Went Well</label>
                <textarea className={inputClass + ' min-h-[80px]'} style={inputStyle} value={form.wentWell} onChange={e => updateField('wentWell', e.target.value)} placeholder="Communication was excellent, milestones hit on time..." />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>What Went Wrong</label>
                <textarea className={inputClass + ' min-h-[80px]'} style={inputStyle} value={form.wentWrong} onChange={e => updateField('wentWrong', e.target.value)} placeholder="Scope creep in phase 2, unclear requirements..." />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Client Satisfaction (1-5)</label>
                <StarRating value={form.satisfaction} onChange={v => updateField('satisfaction', v)} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Would You Work With This Client Again?</label>
                <div className="flex gap-3">
                  {['Yes', 'Maybe', 'No'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField('workAgain', opt)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={form.workAgain === opt
                        ? opt === 'Yes' ? { background: 'var(--success-soft)', color: 'var(--success)', border: '1px solid var(--success)' }
                        : opt === 'Maybe' ? { background: 'var(--warning-soft)', color: 'var(--warning)', border: '1px solid var(--warning)' }
                        : { background: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid var(--danger)' }
                        : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Key Lesson</label>
                <textarea className={inputClass + ' min-h-[60px]'} style={inputStyle} value={form.keyLesson} onChange={e => updateField('keyLesson', e.target.value)} placeholder="Always get sign-off before starting the next phase..." />
              </div>
            </div>
          </ResultCard>

          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 font-medium rounded-lg transition-colors text-sm" style={btnPrimary}>{editingId ? 'Update Post-Mortem' : 'Save Post-Mortem'}</button>
            {editingId && (
              <button type="button" className="px-4 py-2 rounded-lg transition-colors text-sm" style={btnSecondary} onClick={() => { setForm({ ...emptyForm }); setEditingId(null) }}>Cancel Edit</button>
            )}
          </div>
        </form>
      )}

      {/* History */}
      {view === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input className={inputClass + ' flex-1'} style={inputStyle} placeholder="Search projects or clients..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className={inputClass + ' sm:w-48'} style={inputStyle} value={filterService} onChange={e => setFilterService(e.target.value)}>
              <option value="">All Services</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <ResultCard>
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No post-mortems yet. Create your first one!</p>
            </ResultCard>
          ) : (
            <div className="grid gap-3">
              {filtered.map(entry => (
                <ResultCard key={entry.id} className="cursor-pointer transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium" style={{ color: 'var(--text-heading)' }}>{entry.projectName}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{entry.serviceType}</span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{entry.clientName} &middot; {entry.completionDate || 'No date'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <StarRating value={entry.satisfaction} readOnly />
                        <span className="text-xs font-medium" style={{ color: entry.workAgain === 'Yes' ? 'var(--success)' : entry.workAgain === 'Maybe' ? 'var(--warning)' : 'var(--danger)' }}>{entry.workAgain}</span>
                      </div>
                      <div className="text-right text-sm">
                        <p style={{ color: 'var(--text-heading)' }}>${(entry.actualBudget || 0).toLocaleString()}</p>
                        <p className="text-xs" style={{ color: entry.actualBudget > entry.originalBudget ? 'var(--danger)' : 'var(--success)' }}>
                          {entry.originalBudget > 0 ? `${((entry.actualBudget / entry.originalBudget) * 100).toFixed(0)}% of budget` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedEntry?.id === entry.id && (
                    <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="mb-1" style={{ color: 'var(--text-muted)' }}>Budget</p>
                          <p style={{ color: 'var(--text-body)' }}>Original: ${entry.originalBudget.toLocaleString()} &rarr; Actual: ${entry.actualBudget.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="mb-1" style={{ color: 'var(--text-muted)' }}>Timeline</p>
                          <p style={{ color: 'var(--text-body)' }}>Original: {entry.originalTimeline}d &rarr; Actual: {entry.actualTimeline}d</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>What Went Well</p>
                        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>{entry.wentWell || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>What Went Wrong</p>
                        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>{entry.wentWrong || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Key Lesson</p>
                        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>{entry.keyLesson || 'N/A'}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button className="px-4 py-2 font-medium rounded-lg transition-colors text-sm" style={btnPrimary} onClick={(e) => { e.stopPropagation(); exportPDF(entry) }}>Export PDF</button>
                        <button className="px-4 py-2 rounded-lg transition-colors text-sm" style={btnSecondary} onClick={(e) => { e.stopPropagation(); handleEdit(entry) }}>Edit</button>
                        <button className="px-4 py-2 rounded-lg transition-colors text-sm" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}>Delete</button>
                        <CopyButton text={JSON.stringify(entry, null, 2)} label="Copy JSON" />
                      </div>
                    </div>
                  )}
                </ResultCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pattern Analysis */}
      {view === 'analysis' && (
        <div className="space-y-6">
          {entries.length < 3 ? (
            <ResultCard>
              <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Add at least 3 post-mortems to unlock pattern analysis. You have {entries.length} so far.</p>
            </ResultCard>
          ) : analysis && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Avg Budget Accuracy', value: `${analysis.avgBudgetAccuracy}%`, sub: parseFloat(analysis.avgBudgetAccuracy) > 100 ? 'Over budget trend' : 'Under budget trend', colorVar: parseFloat(analysis.avgBudgetAccuracy) > 110 ? 'var(--danger)' : 'var(--success)' },
                  { label: 'Avg Timeline Overrun', value: `${analysis.avgTimelineOverrun}%`, sub: parseFloat(analysis.avgTimelineOverrun) > 0 ? 'Projects run late' : 'On time or early', colorVar: parseFloat(analysis.avgTimelineOverrun) > 10 ? 'var(--danger)' : 'var(--success)' },
                  { label: 'Avg Satisfaction', value: `${analysis.avgSatisfaction}/5`, sub: `${analysis.totalProjects} projects`, colorVar: parseFloat(analysis.avgSatisfaction) >= 4 ? 'var(--success)' : parseFloat(analysis.avgSatisfaction) >= 3 ? 'var(--warning)' : 'var(--danger)' },
                  { label: 'Most Profitable', value: analysis.mostProfitable ? analysis.mostProfitable[0] : 'N/A', sub: analysis.mostProfitable ? `$${analysis.mostProfitable[1].revenue.toLocaleString()} total` : '', colorVar: 'var(--accent)' }
                ].map((stat, i) => (
                  <ResultCard key={i}>
                    <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: stat.colorVar }}>{stat.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.sub}</p>
                  </ResultCard>
                ))}
              </div>

              <ResultCard title="Work Again Distribution" icon="&#128101;">
                <div className="flex gap-4">
                  {Object.entries(analysis.workAgainStats).map(([key, count]) => (
                    <div key={key} className="flex-1 text-center">
                      <div className="text-3xl font-bold" style={{ color: key === 'Yes' ? 'var(--success)' : key === 'Maybe' ? 'var(--warning)' : 'var(--danger)' }}>{count}</div>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{key}</p>
                      <div className="w-full rounded-full h-2 mt-2" style={{ background: 'var(--bg-elevated)' }}>
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${entries.length > 0 ? (count / entries.length) * 100 : 0}%`, background: key === 'Yes' ? 'var(--success)' : key === 'Maybe' ? 'var(--warning)' : 'var(--danger)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ResultCard>

              <ResultCard title="Common Issue Keywords" icon="&#9888;">
                {analysis.commonIssues.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.commonIssues.map(([word, count]) => (
                      <span key={word} className="px-3 py-1.5 rounded-full text-sm" style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
                        {word} ({count}x)
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No common issues found yet.</p>
                )}
              </ResultCard>

              <ResultCard title="Budget Accuracy by Project" icon="&#128200;">
                <div className="space-y-2">
                  {entries.filter(e => e.originalBudget > 0).map(e => {
                    const pct = (e.actualBudget / e.originalBudget) * 100
                    return (
                      <div key={e.id} className="flex items-center gap-3">
                        <span className="text-sm w-40 truncate" style={{ color: 'var(--text-body)' }}>{e.projectName}</span>
                        <div className="flex-1 rounded-full h-3 relative" style={{ background: 'var(--bg-elevated)' }}>
                          <div
                            className="h-3 rounded-full"
                            style={{ width: `${Math.min(pct, 150) / 1.5}%`, background: pct > 110 ? 'var(--danger)' : pct > 100 ? 'var(--warning)' : 'var(--success)' }}
                          />
                        </div>
                        <span className="text-sm font-medium w-16 text-right" style={{ color: pct > 110 ? 'var(--danger)' : pct > 100 ? 'var(--warning)' : 'var(--success)' }}>{pct.toFixed(0)}%</span>
                      </div>
                    )
                  })}
                </div>
              </ResultCard>

              <button className="px-4 py-2 font-medium rounded-lg transition-colors text-sm" style={btnPrimary} onClick={() => exportPDF(null)}>Export Aggregate Report (PDF)</button>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
