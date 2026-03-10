import React, { useState, useMemo, useRef } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { jsPDF } from 'jspdf'

const COLUMNS = [
  { id: 'lead', label: 'Lead', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-indigo-500' },
  { id: 'proposal', label: 'Proposal Sent', color: 'bg-purple-500' },
  { id: 'negotiating', label: 'Negotiating', color: 'bg-yellow-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500' }
]

const TEMPS = [
  { value: 'hot', label: 'Hot', color: 'bg-red-500', colorVar: 'var(--danger)' },
  { value: 'warm', label: 'Warm', color: 'bg-yellow-500', colorVar: 'var(--warning)' },
  { value: 'cold', label: 'Cold', color: 'bg-blue-400', colorVar: 'var(--info)' }
]

function emptyCard(stage = 'lead') {
  return {
    id: crypto.randomUUID(),
    name: '',
    company: '',
    service: '',
    value: '',
    lastContact: '',
    nextFollowUp: '',
    temperature: 'warm',
    stage,
    notes: [],
    createdAt: new Date().toISOString()
  }
}

export default function App() {
  const [cards, setCards] = useLocalStorage('skynet-microcrm-cards', [])
  const [quickAddCol, setQuickAddCol] = useState(null)
  const [quickForm, setQuickForm] = useState(emptyCard())
  const [selectedCard, setSelectedCard] = useState(null)
  const [newNote, setNewNote] = useState('')
  const [dragId, setDragId] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const fileInputRef = useRef(null)

  const updateCards = (fn) => setCards(fn)

  const addCard = (stage) => {
    if (!quickForm.name.trim()) return
    const card = { ...quickForm, stage, id: crypto.randomUUID(), createdAt: new Date().toISOString(), value: parseFloat(quickForm.value) || 0 }
    updateCards(prev => [...prev, card])
    setQuickForm(emptyCard())
    setQuickAddCol(null)
  }

  const updateCard = (id, updates) => {
    updateCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    if (selectedCard?.id === id) setSelectedCard(p => ({ ...p, ...updates }))
  }

  const deleteCard = (id) => {
    if (!confirm('Delete this deal?')) return
    updateCards(prev => prev.filter(c => c.id !== id))
    if (selectedCard?.id === id) setSelectedCard(null)
  }

  const addNote = () => {
    if (!newNote.trim() || !selectedCard) return
    const note = { text: newNote.trim(), date: new Date().toISOString() }
    const updated = [...(selectedCard.notes || []), note]
    updateCard(selectedCard.id, { notes: updated })
    setNewNote('')
  }

  // Drag handlers (HTML5 native for Firefox compat)
  const handleDragStart = (e, id) => {
    setDragId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(colId)
  }

  const handleDrop = (e, colId) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || dragId
    if (id) {
      updateCards(prev => prev.map(c => c.id === id ? { ...c, stage: colId } : c))
    }
    setDragId(null)
    setDragOver(null)
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDragOver(null)
  }

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const thisMonth = new Date().toISOString().slice(0, 7)

    const pipelineValue = cards
      .filter(c => !['won', 'lost'].includes(c.stage))
      .reduce((s, c) => s + (parseFloat(c.value) || 0), 0)

    const proposalsPending = cards.filter(c => c.stage === 'proposal').length

    const wonCards = cards.filter(c => c.stage === 'won')
    const lostCards = cards.filter(c => c.stage === 'lost')
    const totalDecided = wonCards.length + lostCards.length
    const winRate = totalDecided > 0 ? ((wonCards.length / totalDecided) * 100).toFixed(0) : 0

    const revenueThisMonth = wonCards
      .filter(c => c.createdAt?.slice(0, 7) === thisMonth)
      .reduce((s, c) => s + (parseFloat(c.value) || 0), 0)

    const overdueFollowUps = cards.filter(c => c.nextFollowUp && c.nextFollowUp < today && !['won', 'lost'].includes(c.stage)).length

    return { pipelineValue, proposalsPending, winRate, revenueThisMonth, overdueFollowUps }
  }, [cards])

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'microcrm-export.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (Array.isArray(data)) setCards(data)
      } catch { alert('Invalid JSON file') }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const inputClass = 'w-full rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none transition-colors'
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }
  const btnPrimaryStyle = { background: 'var(--accent)', color: 'var(--text-heading)' }
  const btnSecondaryStyle = { background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '1px solid var(--border)' }

  const tempInfo = (t) => TEMPS.find(x => x.value === t) || TEMPS[1]

  return (
    <ToolLayout
      title="Freelance Pipeline Micro-CRM"
      description="Track deals from lead to close. Drag cards between stages, manage follow-ups, and monitor your pipeline."
    >
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Pipeline Value', value: `$${stats.pipelineValue.toLocaleString()}`, colorVar: 'var(--accent)' },
          { label: 'Proposals Pending', value: stats.proposalsPending, colorVar: 'var(--info)' },
          { label: 'Win Rate', value: `${stats.winRate}%`, colorVar: 'var(--success)' },
          { label: 'Revenue (Month)', value: `$${stats.revenueThisMonth.toLocaleString()}`, colorVar: 'var(--info)' },
          { label: 'Overdue Follow-ups', value: stats.overdueFollowUps, colorVar: stats.overdueFollowUps > 0 ? 'var(--danger)' : 'var(--text-muted)' }
        ].map((s, i) => (
          <ResultCard key={i}>
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: s.colorVar }}>{s.value}</p>
            {s.label === 'Overdue Follow-ups' && stats.overdueFollowUps > 0 && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full animate-pulse" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>Action needed</span>
            )}
          </ResultCard>
        ))}
      </div>

      {/* Import/Export */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={exportJSON} className="px-3 py-1.5 rounded-lg transition-colors text-sm" style={btnSecondaryStyle}>Export JSON</button>
        <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg transition-colors text-sm" style={btnSecondaryStyle}>Import JSON</button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={importJSON} className="hidden" />
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-[1200px]">
          {COLUMNS.map(col => {
            const colCards = cards.filter(c => c.stage === col.id)
            const colValue = colCards.reduce((s, c) => s + (parseFloat(c.value) || 0), 0)
            return (
              <div
                key={col.id}
                className="flex-1 min-w-[190px] rounded-xl transition-colors"
                style={{ border: dragOver === col.id ? '1px solid var(--accent)' : '1px solid var(--border)', background: dragOver === col.id ? 'var(--accent-soft)' : 'var(--bg-elevated)' }}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                      <span className="font-medium text-sm" style={{ color: 'var(--text-heading)' }}>{col.label}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({colCards.length})</span>
                    </div>
                    <button onClick={() => { setQuickAddCol(quickAddCol === col.id ? null : col.id); setQuickForm(emptyCard(col.id)) }} className="text-lg leading-none hover:opacity-80" style={{ color: 'var(--accent)' }} title="Quick add">+</button>
                  </div>
                  {colValue > 0 && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>${colValue.toLocaleString()}</p>}
                </div>

                {/* Quick Add Form */}
                {quickAddCol === col.id && (
                  <div className="p-3 space-y-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                    <input className={inputClass} style={inputStyle} value={quickForm.name} onChange={e => setQuickForm(p => ({ ...p, name: e.target.value }))} placeholder="Contact name *" autoFocus />
                    <input className={inputClass} style={inputStyle} value={quickForm.company} onChange={e => setQuickForm(p => ({ ...p, company: e.target.value }))} placeholder="Company" />
                    <input className={inputClass} style={inputStyle} value={quickForm.service} onChange={e => setQuickForm(p => ({ ...p, service: e.target.value }))} placeholder="Service" />
                    <input type="number" className={inputClass} style={inputStyle} value={quickForm.value} onChange={e => setQuickForm(p => ({ ...p, value: e.target.value }))} placeholder="Value ($)" />
                    <select className={inputClass} style={inputStyle} value={quickForm.temperature} onChange={e => setQuickForm(p => ({ ...p, temperature: e.target.value }))}>
                      {TEMPS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => addCard(col.id)} className="flex-1 text-xs py-1.5 px-4 font-medium rounded-lg transition-colors" style={btnPrimaryStyle}>Add</button>
                      <button onClick={() => setQuickAddCol(null)} className="text-xs py-1.5 px-3 rounded-lg transition-colors" style={btnSecondaryStyle}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[100px]">
                  {colCards.map(card => {
                    const ti = tempInfo(card.temperature)
                    const today = new Date().toISOString().slice(0, 10)
                    const overdue = card.nextFollowUp && card.nextFollowUp < today && !['won', 'lost'].includes(card.stage)
                    return (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedCard(card)}
                        className="rounded-lg p-3 cursor-pointer transition-all"
                        style={{ background: 'var(--bg-card)', border: overdue ? '1px solid var(--danger)' : '1px solid var(--border)', opacity: dragId === card.id ? 0.4 : 1 }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-heading)' }}>{card.name}</p>
                            {card.company && <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{card.company}</p>}
                          </div>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${ti.color}`} title={ti.label} />
                        </div>
                        {card.service && <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>{card.service}</p>}
                        <div className="flex items-center justify-between mt-2">
                          {card.value ? <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>${parseFloat(card.value).toLocaleString()}</span> : <span />}
                          {overdue && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>Overdue</span>}
                        </div>
                        {card.nextFollowUp && !overdue && (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Follow-up: {card.nextFollowUp}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Side Panel */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedCard(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-md h-full overflow-y-auto" style={{ background: 'var(--bg-page)', borderLeft: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>Deal Details</h3>
                <button onClick={() => setSelectedCard(null)} className="text-xl hover:opacity-80" style={{ color: 'var(--text-muted)' }}>&times;</button>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Name</label>
                  <input className={inputClass} style={inputStyle} value={selectedCard.name} onChange={e => updateCard(selectedCard.id, { name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Company</label>
                  <input className={inputClass} style={inputStyle} value={selectedCard.company} onChange={e => updateCard(selectedCard.id, { company: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Service</label>
                    <input className={inputClass} style={inputStyle} value={selectedCard.service} onChange={e => updateCard(selectedCard.id, { service: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Value ($)</label>
                    <input type="number" className={inputClass} style={inputStyle} value={selectedCard.value} onChange={e => updateCard(selectedCard.id, { value: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Last Contact</label>
                    <input type="date" className={inputClass} style={inputStyle} value={selectedCard.lastContact || ''} onChange={e => updateCard(selectedCard.id, { lastContact: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Next Follow-up</label>
                    <input type="date" className={inputClass} style={inputStyle} value={selectedCard.nextFollowUp || ''} onChange={e => updateCard(selectedCard.id, { nextFollowUp: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Temperature</label>
                  <div className="flex gap-2">
                    {TEMPS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => updateCard(selectedCard.id, { temperature: t.value })}
                        className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={selectedCard.temperature === t.value
                          ? { background: 'var(--bg-elevated)', color: t.colorVar, border: `1px solid ${t.colorVar}` }
                          : { background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full ${t.color} mr-1.5`} />{t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Stage</label>
                  <select className={inputClass} style={inputStyle} value={selectedCard.stage} onChange={e => updateCard(selectedCard.id, { stage: e.target.value })}>
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-medium text-sm mb-2" style={{ color: 'var(--text-heading)' }}>Notes History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                  {(selectedCard.notes || []).length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notes yet.</p>
                  ) : (
                    [...(selectedCard.notes || [])].reverse().map((note, i) => (
                      <div key={i} className="rounded-lg p-2" style={{ background: 'var(--bg-elevated)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-body)' }}>{note.text}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{new Date(note.date).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input className={inputClass + ' flex-1'} style={inputStyle} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." onKeyDown={e => e.key === 'Enter' && addNote()} />
                  <button onClick={addNote} className="px-4 py-2 font-medium rounded-lg transition-colors text-sm text-xs" style={btnPrimaryStyle}>Add</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <CopyButton text={JSON.stringify(selectedCard, null, 2)} label="Copy" />
                <button onClick={() => deleteCard(selectedCard.id)} className="px-3 py-1.5 rounded-lg transition-colors text-sm" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>Delete Deal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
