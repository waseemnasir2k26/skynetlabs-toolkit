import React, { useState, useMemo, useCallback } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import ShareButton from '../shared/ShareButton'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'

const STATUS_COLORS = {
  green: { dot: 'bg-green-400', label: 'On Track' },
  yellow: { dot: 'bg-yellow-400', label: 'At Risk' },
  red: { dot: 'bg-red-400', label: 'Overdue' },
}

const INVOICE_STATUS = {
  paid: { icon: '\u2705', label: 'Paid' },
  pending: { icon: '\u23F3', label: 'Pending' },
  overdue: { icon: '\u2757', label: 'Overdue' },
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

function formatCountdown(days) {
  if (days === null) return 'No deadline'
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= 7) return `${days}d left`
  if (days <= 30) return `${Math.ceil(days / 7)}w left`
  return `${Math.ceil(days / 30)}mo left`
}

function isThisWeek(dateStr) {
  const days = getDaysUntil(dateStr)
  return days !== null && days >= 0 && days <= 7
}

const emptyClient = {
  clientName: '',
  projectName: '',
  status: 'green',
  deadline: '',
  monthlyRevenue: '',
  invoiceStatus: 'pending',
  notes: [],
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>{title}</h2>
          <button onClick={onClose} className="hover:opacity-80 transition-colors text-2xl leading-none" style={{ color: 'var(--text-muted)' }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function NoteModal({ open, onClose, onSave }) {
  const [note, setNote] = useState('')
  const handleSave = () => {
    if (note.trim()) {
      onSave(note.trim())
      setNote('')
      onClose()
    }
  }
  return (
    <Modal open={open} onClose={onClose} title="Add Note">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        className="w-full rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none resize-none"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
        placeholder="Enter note..."
      />
      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onClose} className="px-4 py-2 hover:opacity-80 transition-colors" style={{ color: 'var(--text-muted)' }}>Cancel</button>
        <button onClick={handleSave} className="px-5 py-2 rounded-xl font-medium transition-colors hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>Save Note</button>
      </div>
    </Modal>
  )
}

function ClientCard({ client, onUpdate, onDelete }) {
  const [showNotes, setShowNotes] = useState(false)
  const [noteModal, setNoteModal] = useState(false)
  const days = getDaysUntil(client.deadline)
  const countdownText = formatCountdown(days)
  const countdownStyle = days === null ? { color: 'var(--text-muted)' } : days < 0 ? { color: 'var(--danger)' } : days <= 3 ? { color: 'var(--warning)' } : { color: 'var(--success)' }

  const cycleStatus = () => {
    const order = ['green', 'yellow', 'red']
    const next = order[(order.indexOf(client.status) + 1) % 3]
    onUpdate({ ...client, status: next })
  }

  const cycleInvoice = () => {
    const order = ['pending', 'paid', 'overdue']
    const next = order[(order.indexOf(client.invoiceStatus) + 1) % 3]
    onUpdate({ ...client, invoiceStatus: next })
  }

  const addNote = (note) => {
    onUpdate({ ...client, notes: [...(client.notes || []), { id: generateId(), text: note, date: new Date().toISOString() }] })
  }

  const markComplete = () => {
    onUpdate({ ...client, status: 'green', invoiceStatus: 'paid', completedAt: new Date().toISOString() })
  }

  return (
    <>
      <div className="rounded-xl p-5 transition-all group" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <button onClick={cycleStatus} title={`Status: ${STATUS_COLORS[client.status].label} (click to cycle)`}>
              <span className={`inline-block w-3 h-3 rounded-full ${STATUS_COLORS[client.status].dot} ring-2 cursor-pointer hover:ring-white/30 transition-all`} style={{ '--tw-ring-color': 'var(--border)' }} />
            </button>
            <h3 className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>{client.clientName}</h3>
          </div>
          <button onClick={() => onDelete(client.id)} className="transition-colors opacity-0 group-hover:opacity-100 text-lg hover:opacity-70" style={{ color: 'var(--danger)' }} title="Delete">&times;</button>
        </div>

        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Project: <span style={{ color: 'var(--text-body)' }}>{client.projectName || 'N/A'}</span></p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={countdownStyle}>{countdownText}</span>
          <button onClick={cycleInvoice} className="text-lg cursor-pointer hover:scale-110 transition-transform" title={`Invoice: ${INVOICE_STATUS[client.invoiceStatus].label} (click to cycle)`}>
            {INVOICE_STATUS[client.invoiceStatus].icon}
          </button>
        </div>

        {client.monthlyRevenue && (
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--accent)' }}>${Number(client.monthlyRevenue).toLocaleString()}/mo</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setNoteModal(true)} className="px-3 py-1.5 text-xs rounded-lg transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>+ Note</button>
          <button onClick={() => setShowNotes(!showNotes)} className="px-3 py-1.5 text-xs rounded-lg transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            Notes ({(client.notes || []).length})
          </button>
          <button onClick={markComplete} className="px-3 py-1.5 text-xs rounded-lg transition-all ml-auto hover:opacity-80" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Mark Complete</button>
        </div>

        {showNotes && (client.notes || []).length > 0 && (
          <div className="mt-3 pt-3 space-y-2 max-h-40 overflow-y-auto" style={{ borderTop: '1px solid var(--border)' }}>
            {(client.notes || []).map((n) => (
              <div key={n.id} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{new Date(n.date).toLocaleDateString()}</span> &mdash; {n.text}
              </div>
            ))}
          </div>
        )}
      </div>
      <NoteModal open={noteModal} onClose={() => setNoteModal(false)} onSave={addNote} />
    </>
  )
}

export default function App() {
  const [clients, setClients] = useLocalStorage('skynet-command-center-clients', [])
  const [showModal, setShowModal] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [form, setForm] = useState({ ...emptyClient })
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('deadline')
  const [search, setSearch] = useState('')

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSave = () => {
    if (!form.clientName.trim()) return
    if (editClient) {
      setClients((prev) => prev.map((c) => (c.id === editClient.id ? { ...editClient, ...form } : c)))
    } else {
      setClients((prev) => [...prev, { ...form, id: generateId(), createdAt: new Date().toISOString(), notes: [] }])
    }
    setForm({ ...emptyClient })
    setEditClient(null)
    setShowModal(false)
  }

  const handleEdit = (client) => {
    setEditClient(client)
    setForm({
      clientName: client.clientName,
      projectName: client.projectName,
      status: client.status,
      deadline: client.deadline,
      monthlyRevenue: client.monthlyRevenue,
      invoiceStatus: client.invoiceStatus,
    })
    setShowModal(true)
  }

  const handleDelete = useCallback((id) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
  }, [setClients])

  const handleUpdate = useCallback((updated) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }, [setClients])

  const openAdd = () => {
    setEditClient(null)
    setForm({ ...emptyClient })
    setShowModal(true)
  }

  // Stats
  const stats = useMemo(() => {
    const active = clients.filter((c) => c.status !== 'completed')
    const dueThisWeek = clients.filter((c) => isThisWeek(c.deadline))
    const overdue = clients.filter((c) => { const d = getDaysUntil(c.deadline); return d !== null && d < 0 })
    const totalRevenue = clients.reduce((sum, c) => sum + (Number(c.monthlyRevenue) || 0), 0)
    return { active: active.length, dueThisWeek: dueThisWeek.length, overdue: overdue.length, totalRevenue }
  }, [clients])

  // Filter + Sort
  const filtered = useMemo(() => {
    let list = [...clients]

    if (search) {
      const s = search.toLowerCase()
      list = list.filter((c) => c.clientName.toLowerCase().includes(s) || c.projectName.toLowerCase().includes(s))
    }

    switch (filter) {
      case 'urgent':
        list = list.filter((c) => c.status === 'red' || c.invoiceStatus === 'overdue')
        break
      case 'thisweek':
        list = list.filter((c) => isThisWeek(c.deadline))
        break
      case 'overdue':
        list = list.filter((c) => { const d = getDaysUntil(c.deadline); return d !== null && d < 0 })
        break
    }

    switch (sort) {
      case 'deadline':
        list.sort((a, b) => {
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline) - new Date(b.deadline)
        })
        break
      case 'revenue':
        list.sort((a, b) => (Number(b.monthlyRevenue) || 0) - (Number(a.monthlyRevenue) || 0))
        break
      case 'name':
        list.sort((a, b) => a.clientName.localeCompare(b.clientName))
        break
    }

    return list
  }, [clients, filter, sort, search])

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'urgent', label: 'Urgent' },
    { key: 'thisweek', label: 'This Week' },
    { key: 'overdue', label: 'Overdue' },
  ]

  const sorts = [
    { key: 'deadline', label: 'Deadline' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'name', label: 'Name' },
  ]

  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }

  return (
    <ToolLayout title="Multi-Client Command Center" description="Dashboard to manage all your clients, projects, deadlines, and invoices in one place.">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Clients', value: stats.active, colorVar: 'var(--accent)' },
          { label: 'Due This Week', value: stats.dueThisWeek, colorVar: 'var(--warning)' },
          { label: 'Overdue Items', value: stats.overdue, colorVar: 'var(--danger)' },
          { label: 'Monthly Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, colorVar: 'var(--accent)' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <p className="text-2xl font-bold" style={{ color: s.colorVar }}>{s.value}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-2 text-sm rounded-xl transition-all"
              style={filter === f.key ? { background: 'var(--accent)', color: 'var(--text-heading)' } : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="flex-1 sm:w-48 rounded-xl px-4 py-2 text-sm placeholder-gray-500 focus:outline-none"
            style={inputStyle}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-body)' }}
          >
            {sorts.map((s) => (
              <option key={s.key} value={s.key}>Sort: {s.label}</option>
            ))}
          </select>
          <button onClick={openAdd} className="px-5 py-2 rounded-xl font-medium transition-colors text-sm whitespace-nowrap hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>
            + Add Client
          </button>
        </div>
      </div>

      {/* Client Grid */}
      {filtered.length === 0 ? (
        <ResultCard>
          <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            {clients.length === 0 ? 'No clients yet. Click "+ Add Client" to get started.' : 'No clients match the current filter.'}
          </p>
        </ResultCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <ClientCard key={client.id} client={client} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editClient ? 'Edit Client/Project' : 'Add Client/Project'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Client Name *</label>
            <input
              type="text"
              value={form.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
              className="w-full rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none"
              style={inputStyle}
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Project Name</label>
            <input
              type="text"
              value={form.projectName}
              onChange={(e) => updateField('projectName', e.target.value)}
              className="w-full rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none"
              style={inputStyle}
              placeholder="Website Redesign"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full rounded-xl px-4 py-3 focus:outline-none"
                style={inputStyle}
              >
                <option value="green">On Track</option>
                <option value="yellow">At Risk</option>
                <option value="red">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Invoice Status</label>
              <select
                value={form.invoiceStatus}
                onChange={(e) => updateField('invoiceStatus', e.target.value)}
                className="w-full rounded-xl px-4 py-3 focus:outline-none"
                style={inputStyle}
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => updateField('deadline', e.target.value)}
                className="w-full rounded-xl px-4 py-3 focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Monthly Revenue ($)</label>
              <input
                type="number"
                value={form.monthlyRevenue}
                onChange={(e) => updateField('monthlyRevenue', e.target.value)}
                className="w-full rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none"
                style={inputStyle}
                placeholder="2500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Cancel</button>
            <button onClick={handleSave} className="px-6 py-2.5 rounded-xl font-medium transition-colors hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>
              {editClient ? 'Update' : 'Add Client'}
            </button>
          </div>
        </div>
      </Modal>
      {/* Share */}
      <div className="flex justify-center mt-6">
        <ShareButton getShareURL={() => window.location.origin + '/command-center'} />
      </div>
    </ToolLayout>
  )
}
