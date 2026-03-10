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
  { value: 'hot', label: 'Hot', color: 'bg-red-500', textColor: 'text-red-400' },
  { value: 'warm', label: 'Warm', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  { value: 'cold', label: 'Cold', color: 'bg-blue-400', textColor: 'text-blue-400' }
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

  const inputClass = 'w-full bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors'
  const btnPrimary = 'px-4 py-2 bg-primary hover:bg-primary-light text-black font-medium rounded-lg transition-colors text-sm'
  const btnSecondary = 'px-3 py-1.5 bg-dark-200/50 hover:bg-dark-200 text-gray-300 hover:text-white border border-white/10 rounded-lg transition-colors text-sm'

  const tempInfo = (t) => TEMPS.find(x => x.value === t) || TEMPS[1]

  return (
    <ToolLayout
      title="Freelance Pipeline Micro-CRM"
      description="Track deals from lead to close. Drag cards between stages, manage follow-ups, and monitor your pipeline."
    >
      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Pipeline Value', value: `$${stats.pipelineValue.toLocaleString()}`, color: 'text-primary' },
          { label: 'Proposals Pending', value: stats.proposalsPending, color: 'text-purple-400' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-green-400' },
          { label: 'Revenue (Month)', value: `$${stats.revenueThisMonth.toLocaleString()}`, color: 'text-blue-400' },
          { label: 'Overdue Follow-ups', value: stats.overdueFollowUps, color: stats.overdueFollowUps > 0 ? 'text-red-400' : 'text-gray-400' }
        ].map((s, i) => (
          <ResultCard key={i}>
            <p className="text-gray-400 text-xs uppercase tracking-wide">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            {s.label === 'Overdue Follow-ups' && stats.overdueFollowUps > 0 && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 animate-pulse">Action needed</span>
            )}
          </ResultCard>
        ))}
      </div>

      {/* Import/Export */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={exportJSON} className={btnSecondary}>Export JSON</button>
        <button onClick={() => fileInputRef.current?.click()} className={btnSecondary}>Import JSON</button>
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
                className={`flex-1 min-w-[190px] rounded-xl border transition-colors ${dragOver === col.id ? 'border-primary/50 bg-primary/5' : 'border-white/5 bg-dark-100/30'}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                      <span className="text-white font-medium text-sm">{col.label}</span>
                      <span className="text-gray-500 text-xs">({colCards.length})</span>
                    </div>
                    <button onClick={() => { setQuickAddCol(quickAddCol === col.id ? null : col.id); setQuickForm(emptyCard(col.id)) }} className="text-gray-500 hover:text-primary text-lg leading-none" title="Quick add">+</button>
                  </div>
                  {colValue > 0 && <p className="text-gray-500 text-xs mt-1">${colValue.toLocaleString()}</p>}
                </div>

                {/* Quick Add Form */}
                {quickAddCol === col.id && (
                  <div className="p-3 border-b border-white/5 bg-dark-200/20 space-y-2">
                    <input className={inputClass} value={quickForm.name} onChange={e => setQuickForm(p => ({ ...p, name: e.target.value }))} placeholder="Contact name *" autoFocus />
                    <input className={inputClass} value={quickForm.company} onChange={e => setQuickForm(p => ({ ...p, company: e.target.value }))} placeholder="Company" />
                    <input className={inputClass} value={quickForm.service} onChange={e => setQuickForm(p => ({ ...p, service: e.target.value }))} placeholder="Service" />
                    <input type="number" className={inputClass} value={quickForm.value} onChange={e => setQuickForm(p => ({ ...p, value: e.target.value }))} placeholder="Value ($)" />
                    <select className={inputClass} value={quickForm.temperature} onChange={e => setQuickForm(p => ({ ...p, temperature: e.target.value }))}>
                      {TEMPS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => addCard(col.id)} className={btnPrimary + ' flex-1 text-xs py-1.5'}>Add</button>
                      <button onClick={() => setQuickAddCol(null)} className={btnSecondary + ' text-xs py-1.5'}>Cancel</button>
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
                        className={`bg-dark-200/50 border rounded-lg p-3 cursor-pointer hover:border-primary/30 transition-all ${dragId === card.id ? 'opacity-40' : ''} ${overdue ? 'border-red-500/30' : 'border-white/10'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">{card.name}</p>
                            {card.company && <p className="text-gray-400 text-xs truncate">{card.company}</p>}
                          </div>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${ti.color}`} title={ti.label} />
                        </div>
                        {card.service && <p className="text-gray-500 text-xs mt-1 truncate">{card.service}</p>}
                        <div className="flex items-center justify-between mt-2">
                          {card.value ? <span className="text-primary text-sm font-medium">${parseFloat(card.value).toLocaleString()}</span> : <span />}
                          {overdue && <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Overdue</span>}
                        </div>
                        {card.nextFollowUp && !overdue && (
                          <p className="text-gray-500 text-xs mt-1">Follow-up: {card.nextFollowUp}</p>
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
          <div className="relative w-full max-w-md bg-[#0a0a0f] border-l border-white/10 h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">Deal Details</h3>
                <button onClick={() => setSelectedCard(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Name</label>
                  <input className={inputClass} value={selectedCard.name} onChange={e => updateCard(selectedCard.id, { name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Company</label>
                  <input className={inputClass} value={selectedCard.company} onChange={e => updateCard(selectedCard.id, { company: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Service</label>
                    <input className={inputClass} value={selectedCard.service} onChange={e => updateCard(selectedCard.id, { service: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Value ($)</label>
                    <input type="number" className={inputClass} value={selectedCard.value} onChange={e => updateCard(selectedCard.id, { value: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Last Contact</label>
                    <input type="date" className={inputClass} value={selectedCard.lastContact || ''} onChange={e => updateCard(selectedCard.id, { lastContact: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Next Follow-up</label>
                    <input type="date" className={inputClass} value={selectedCard.nextFollowUp || ''} onChange={e => updateCard(selectedCard.id, { nextFollowUp: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Temperature</label>
                  <div className="flex gap-2">
                    {TEMPS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => updateCard(selectedCard.id, { temperature: t.value })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCard.temperature === t.value ? `${t.color}/20 ${t.textColor} border border-current` : 'bg-dark-200/50 text-gray-400 border border-white/10'}`}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full ${t.color} mr-1.5`} />{t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Stage</label>
                  <select className={inputClass} value={selectedCard.stage} onChange={e => updateCard(selectedCard.id, { stage: e.target.value })}>
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-white font-medium text-sm mb-2">Notes History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                  {(selectedCard.notes || []).length === 0 ? (
                    <p className="text-gray-500 text-sm">No notes yet.</p>
                  ) : (
                    [...(selectedCard.notes || [])].reverse().map((note, i) => (
                      <div key={i} className="bg-dark-200/30 rounded-lg p-2">
                        <p className="text-gray-300 text-sm">{note.text}</p>
                        <p className="text-gray-500 text-xs mt-1">{new Date(note.date).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input className={inputClass + ' flex-1'} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." onKeyDown={e => e.key === 'Enter' && addNote()} />
                  <button onClick={addNote} className={btnPrimary + ' text-xs'}>Add</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <CopyButton text={JSON.stringify(selectedCard, null, 2)} label="Copy" />
                <button onClick={() => deleteCard(selectedCard.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm">Delete Deal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  )
}
