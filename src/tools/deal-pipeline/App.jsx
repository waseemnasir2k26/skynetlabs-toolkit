import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import FormInput from '../shared/FormInput'
import FormSelect from '../shared/FormSelect'
import EmptyState from '../shared/EmptyState'
import { useToast } from '../shared/Toast'
import { generateId } from '../shared/utils'

/* ── Constants ──────────────────────────────────────────────────── */

const STAGES = [
  { id: 'lead', label: 'Lead', color: 'var(--accent)', softColor: 'var(--accent-soft)' },
  { id: 'proposal', label: 'Proposal Sent', color: '#f59e0b', softColor: 'rgba(245,158,11,0.12)' },
  { id: 'negotiating', label: 'Negotiating', color: '#a855f7', softColor: 'rgba(168,85,247,0.12)' },
  { id: 'won', label: 'Won', color: 'var(--success)', softColor: 'var(--success-soft)' },
  { id: 'lost', label: 'Lost', color: 'var(--danger)', softColor: 'var(--danger-soft)' },
]

const DEFAULT_PROBABILITIES = {
  lead: 20,
  proposal: 40,
  negotiating: 70,
  won: 100,
  lost: 0,
}

const STAGE_OPTIONS = STAGES.map(s => ({ value: s.id, label: s.label }))

function getStage(id) {
  return STAGES.find(s => s.id === id) || STAGES[0]
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function daysBetween(dateStr) {
  if (!dateStr) return 0
  const diff = Date.now() - new Date(dateStr + 'T00:00:00').getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function createEmptyDeal() {
  return {
    id: generateId(),
    clientName: '',
    value: '',
    stage: 'lead',
    probability: DEFAULT_PROBABILITIES.lead,
    expectedClose: '',
    notes: '',
    createdAt: today(),
    updatedAt: today(),
  }
}

/* ── Deal Card (Sortable) ───────────────────────────────────────── */

function SortableDealCard({ deal, onEdit, onDelete, isOverlay, navigate }) {
  const stage = getStage(deal.stage)
  const daysIn = daysBetween(deal.updatedAt)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id, data: { deal } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const cardContent = (
    <div
      ref={!isOverlay ? setNodeRef : undefined}
      style={{
        ...(!isOverlay ? style : {}),
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${stage.color}`,
        borderRadius: 'var(--radius)',
        boxShadow: isOverlay ? '0 8px 24px rgba(0,0,0,0.25)' : 'var(--shadow-card)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className="p-3 mb-2"
      {...(!isOverlay ? { ...attributes, ...listeners } : {})}
    >
      {/* Client Name & Value */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold truncate flex-1 mr-2" style={{ color: 'var(--text-heading)' }}>
          {deal.clientName || 'Untitled Deal'}
        </h4>
        <span className="text-sm font-bold whitespace-nowrap" style={{ color: stage.color }}>
          {fmt(parseFloat(deal.value) || 0)}
        </span>
      </div>

      {/* Probability Badge & Days */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: stage.softColor, color: stage.color }}
        >
          {deal.probability}%
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {daysIn}d in stage
        </span>
      </div>

      {/* Expected Close */}
      {deal.expectedClose && (
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
          Close: {new Date(deal.expectedClose + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}

      {/* Actions Row */}
      <div className="flex items-center gap-1 mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(deal); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-xs px-2 py-1 rounded transition-all"
          style={{ color: 'var(--accent)', background: 'var(--accent-soft)' }}
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/proposal-builder'); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-xs px-2 py-1 rounded transition-all"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}
          title="Create Proposal"
        >
          Proposal &rarr;
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate('/contract-generator'); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-xs px-2 py-1 rounded transition-all"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}
          title="Generate Contract"
        >
          Contract &rarr;
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(deal.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="text-xs px-2 py-1 rounded transition-all ml-auto"
          style={{ color: 'var(--danger)', background: 'var(--danger-soft)' }}
          title="Delete deal"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )

  return cardContent
}

/* ── Kanban Column ──────────────────────────────────────────────── */

function KanbanColumn({ stage, deals, onEdit, onDelete, navigate }) {
  const dealIds = deals.map(d => d.id)
  const totalValue = deals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0)
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col min-w-[240px] flex-1"
      style={{
        background: isOver ? stage.softColor : 'var(--bg-card)',
        border: isOver ? `1px solid ${stage.color}` : '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        borderTop: `3px solid ${stage.color}`,
        transition: 'background 0.2s, border 0.2s',
      }}
    >
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: stage.color }}
          />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
            {stage.label}
          </h3>
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-full"
            style={{ background: stage.softColor, color: stage.color }}
          >
            {deals.length}
          </span>
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          {fmt(totalValue)}
        </span>
      </div>

      {/* Cards */}
      <div className="p-2 flex-1 min-h-[120px] overflow-y-auto" style={{ maxHeight: '60vh' }}>
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map(deal => (
            <SortableDealCard
              key={deal.id}
              deal={deal}
              onEdit={onEdit}
              onDelete={onDelete}
              navigate={navigate}
            />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Drop deals here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Deal Modal ─────────────────────────────────────────────────── */

function DealModal({ deal, onSave, onClose }) {
  const [form, setForm] = useState({ ...deal })

  const update = (field, value) => {
    const next = { ...form, [field]: value }
    // Auto-update probability when stage changes
    if (field === 'stage' && DEFAULT_PROBABILITIES[value] !== undefined) {
      next.probability = DEFAULT_PROBABILITIES[value]
    }
    setForm(next)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.clientName.trim()) return
    onSave({
      ...form,
      value: parseFloat(form.value) || 0,
      probability: parseInt(form.probability) || 0,
      updatedAt: today(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
            {deal.clientName ? 'Edit Deal' : 'Add New Deal'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Client Name"
            value={form.clientName}
            onChange={(e) => update('clientName', e.target.value)}
            placeholder="Acme Corp"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Deal Value ($)"
              type="number"
              value={form.value}
              onChange={(e) => update('value', e.target.value)}
              placeholder="5000"
              prefix="$"
              min="0"
              step="100"
            />
            <FormSelect
              label="Stage"
              value={form.stage}
              onChange={(e) => update('stage', e.target.value)}
              options={STAGE_OPTIONS}
              placeholder=""
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Probability (%)"
              type="number"
              value={form.probability}
              onChange={(e) => update('probability', e.target.value)}
              suffix="%"
              min="0"
              max="100"
              step="5"
            />
            <FormInput
              label="Expected Close"
              type="date"
              value={form.expectedClose}
              onChange={(e) => update('expectedClose', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Any context about this deal..."
              rows={3}
              className="w-full rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none resize-y"
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-heading)',
              }}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-body)',
                border: '1px solid var(--border)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-all"
              style={{
                background: 'var(--accent)',
                color: 'var(--text-on-accent)',
              }}
            >
              {deal.clientName ? 'Save Changes' : 'Add Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Delete Confirmation Modal ──────────────────────────────────── */

function DeleteModal({ dealName, onConfirm, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 text-center"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--danger-soft)' }}
        >
          <svg className="w-6 h-6" style={{ color: 'var(--danger)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-heading)' }}>
          Delete Deal?
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-heading)' }}>{dealName}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-body)',
              border: '1px solid var(--border)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={{
              background: 'var(--danger)',
              color: '#fff',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Custom Recharts Tooltip ────────────────────────────────────── */

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p className="font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>{label}</p>
      <p style={{ color: 'var(--accent)' }}>Forecast: {fmt(payload[0].value)}</p>
    </div>
  )
}

/* ── Main App ───────────────────────────────────────────────────── */

export default function App() {
  const [deals, setDeals] = useLocalStorage('skynet-deal-pipeline-deals', [])
  const [modalDeal, setModalDeal] = useState(null) // deal object or null
  const [deleteDealId, setDeleteDealId] = useState(null)
  const [activeDeal, setActiveDeal] = useState(null) // for drag overlay
  const toast = useToast()
  const navigate = useNavigate()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  /* ── Deal CRUD ─────────────────────────────────────────────── */

  const saveDeal = useCallback((deal) => {
    setDeals((prev) => {
      const exists = prev.find(d => d.id === deal.id)
      if (exists) {
        return prev.map(d => d.id === deal.id ? deal : d)
      }
      return [...prev, { ...deal, createdAt: deal.createdAt || today() }]
    })
    setModalDeal(null)
    if (toast) toast(deal.clientName ? 'Deal saved!' : 'Deal added!', 'success')
  }, [setDeals, toast])

  const confirmDelete = useCallback(() => {
    if (!deleteDealId) return
    setDeals((prev) => prev.filter(d => d.id !== deleteDealId))
    setDeleteDealId(null)
    if (toast) toast('Deal deleted', 'success')
  }, [deleteDealId, setDeals, toast])

  /* ── Drag & Drop ───────────────────────────────────────────── */

  const handleDragStart = useCallback((event) => {
    const deal = deals.find(d => d.id === event.active.id)
    setActiveDeal(deal || null)
  }, [deals])

  const handleDragEnd = useCallback((event) => {
    setActiveDeal(null)
    const { active, over } = event
    if (!over) return

    const dealId = active.id
    // Determine target stage from the over id
    // over.id could be a deal id or a stage column id
    let targetStage = null

    // Check if dropped over a stage column container
    const stageIds = STAGES.map(s => s.id)
    if (stageIds.includes(over.id)) {
      targetStage = over.id
    } else {
      // Dropped over another deal card — find that deal's stage
      const overDeal = deals.find(d => d.id === over.id)
      if (overDeal) {
        targetStage = overDeal.stage
      }
    }

    if (!targetStage) return

    const deal = deals.find(d => d.id === dealId)
    if (!deal || deal.stage === targetStage) return

    setDeals((prev) =>
      prev.map(d =>
        d.id === dealId
          ? {
              ...d,
              stage: targetStage,
              probability: DEFAULT_PROBABILITIES[targetStage],
              updatedAt: today(),
            }
          : d
      )
    )

    const stageName = getStage(targetStage).label
    if (toast) toast(`Moved to ${stageName}`, 'success')
  }, [deals, setDeals, toast])

  const handleDragCancel = useCallback(() => {
    setActiveDeal(null)
  }, [])

  /* ── Stats ─────────────────────────────────────────────────── */

  const stats = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== 'lost')
    const wonDeals = deals.filter(d => d.stage === 'won')
    const closedDeals = deals.filter(d => d.stage === 'won' || d.stage === 'lost')

    const totalPipeline = activeDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0)
    const weightedForecast = activeDeals.reduce(
      (s, d) => s + (parseFloat(d.value) || 0) * ((parseInt(d.probability) || 0) / 100),
      0
    )
    const wonValue = wonDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0)
    const winRate = closedDeals.length > 0 ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0
    const avgDealSize = activeDeals.length > 0
      ? activeDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0) / activeDeals.length
      : 0

    return {
      totalPipeline,
      weightedForecast,
      winRate,
      avgDealSize,
      dealCount: deals.length,
      wonValue,
    }
  }, [deals])

  /* ── Monthly Forecast ──────────────────────────────────────── */

  const forecastData = useMemo(() => {
    const months = {}
    const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost' && d.expectedClose)

    activeDeals.forEach(d => {
      const date = new Date(d.expectedClose + 'T00:00:00')
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      const weighted = (parseFloat(d.value) || 0) * ((parseInt(d.probability) || 0) / 100)
      if (!months[key]) {
        months[key] = { month: label, value: 0, sortKey: key }
      }
      months[key].value += weighted
    })

    return Object.values(months)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(0, 12)
  }, [deals])

  /* ── Deals grouped by stage ────────────────────────────────── */

  const dealsByStage = useMemo(() => {
    const grouped = {}
    STAGES.forEach(s => { grouped[s.id] = [] })
    deals.forEach(d => {
      if (grouped[d.stage]) {
        grouped[d.stage].push(d)
      } else {
        grouped.lead.push(d)
      }
    })
    return grouped
  }, [deals])

  /* ── The deal being deleted (for name in modal) ────────────── */
  const deleteDealName = useMemo(() => {
    if (!deleteDealId) return ''
    const d = deals.find(x => x.id === deleteDealId)
    return d ? d.clientName || 'Untitled Deal' : ''
  }, [deleteDealId, deals])

  /* ── Stat Card Helper ──────────────────────────────────────── */

  const StatCard = ({ label, value, sub, color }) => (
    <div
      className="rounded-xl p-4 flex-1 min-w-[140px]"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: color || 'var(--text-heading)' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <ToolLayout
      title="Deal Flow Pipeline"
      description="Visual Kanban pipeline to track deals from lead to close with drag-and-drop."
      icon="\uD83D\uDD04"
      category="Agency Operations"
      maxWidth="wide"
      proTip="Drag deals between columns to update their stage. Click a deal to edit details, or use the quick links to create proposals and contracts."
    >
      {/* Pipeline Stats Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <StatCard
          label="Total Pipeline"
          value={fmt(stats.totalPipeline)}
          color="var(--accent)"
        />
        <StatCard
          label="Weighted Forecast"
          value={fmt(stats.weightedForecast)}
          sub="value x probability"
          color="var(--accent)"
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate}%`}
          sub="won / closed"
          color="var(--success)"
        />
        <StatCard
          label="Avg Deal Size"
          value={fmt(stats.avgDealSize)}
        />
        <StatCard
          label="Deal Count"
          value={stats.dealCount}
        />
      </div>

      {/* Add Deal Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>
          Pipeline Board
        </h2>
        <button
          onClick={() => setModalDeal(createEmptyDeal())}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all hover:scale-105"
          style={{
            background: 'var(--accent)',
            color: 'var(--text-on-accent)',
            borderRadius: 'var(--radius)',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Deal
        </button>
      </div>

      {/* Empty State */}
      {deals.length === 0 ? (
        <EmptyState
          icon="\uD83D\uDD04"
          title="No deals yet"
          description="Add your first deal to start tracking your pipeline. Drag deals between columns as they progress."
          action="+ Add Your First Deal"
          onAction={() => setModalDeal(createEmptyDeal())}
        />
      ) : (
        /* Kanban Board */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            className="flex gap-3 pb-4 overflow-x-auto"
            style={{ minHeight: '300px' }}
          >
            {STAGES.map(stage => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                deals={dealsByStage[stage.id]}
                onEdit={(deal) => setModalDeal(deal)}
                onDelete={(id) => setDeleteDealId(id)}
                navigate={navigate}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeDeal ? (
              <SortableDealCard
                deal={activeDeal}
                onEdit={() => {}}
                onDelete={() => {}}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Monthly Forecast Chart */}
      {forecastData.length > 0 && (
        <div className="mt-8">
          <ResultCard title="Monthly Revenue Forecast" icon="\uD83D\uDCC8">
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Projected revenue weighted by deal probability, grouped by expected close month.
            </p>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                  />
                  <Tooltip content={<ForecastTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {forecastData.map((_, i) => (
                      <Cell key={i} fill="var(--accent)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ResultCard>
        </div>
      )}

      {/* Modals */}
      {modalDeal && (
        <DealModal
          deal={modalDeal}
          onSave={saveDeal}
          onClose={() => setModalDeal(null)}
        />
      )}

      {deleteDealId && (
        <DeleteModal
          dealName={deleteDealName}
          onConfirm={confirmDelete}
          onClose={() => setDeleteDealId(null)}
        />
      )}
    </ToolLayout>
  )
}
