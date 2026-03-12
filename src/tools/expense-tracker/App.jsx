import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'
import ShareButton from '../shared/ShareButton'
import { generateId } from '../shared/utils'
import { useToast } from '../shared/Toast'

const CATEGORIES = [
  'Software',
  'Equipment',
  'Travel',
  'Office',
  'Marketing',
  'Insurance',
  'Professional Development',
  'Meals',
  'Other',
]

const CATEGORY_COLORS = {
  Software: 'var(--accent)',
  Equipment: 'var(--info)',
  Travel: 'var(--warning)',
  Office: 'var(--success)',
  Marketing: '#a78bfa',
  Insurance: '#f472b6',
  'Professional Development': '#34d399',
  Meals: '#fb923c',
  Other: 'var(--text-muted)',
}

const TAX_BRACKETS = [
  { rate: 25, label: '25%' },
  { rate: 30, label: '30%' },
  { rate: 35, label: '35%' },
]

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n || 0)
}

function getMonthKey(dateStr) {
  if (!dateStr) return 'Unknown'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

export default function App() {
  const toast = useToast()
  const [expenses, setExpenses] = useLocalStorage('skynet-expense-tracker-expenses', [])
  const [editingId, setEditingId] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Software')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setAmount('')
    setCategory('Software')
  }

  const handleSave = () => {
    if (!description || !amount || !date) return
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) return

    if (editingId) {
      setExpenses(prev => prev.map(e =>
        e.id === editingId ? { ...e, date, description, amount: parsedAmount, category } : e
      ))
      if (toast) toast('Expense updated', 'success')
    } else {
      setExpenses(prev => [...prev, {
        id: generateId(),
        date,
        description,
        amount: parsedAmount,
        category,
      }])
      if (toast) toast('Expense added', 'success')
    }
    resetForm()
  }

  const handleEdit = (expense) => {
    setEditingId(expense.id)
    setDate(expense.date)
    setDescription(expense.description)
    setAmount(String(expense.amount))
    setCategory(expense.category)
  }

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
    if (editingId === id) resetForm()
    if (toast) toast('Expense deleted', 'info')
  }

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (filterCategory !== 'All' && e.category !== filterCategory) return false
      if (filterDateFrom && e.date < filterDateFrom) return false
      if (filterDateTo && e.date > filterDateTo) return false
      return true
    }).sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, filterCategory, filterDateFrom, filterDateTo])

  const ytdTotal = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return expenses
      .filter(e => new Date(e.date + 'T00:00:00').getFullYear() === currentYear)
      .reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  const filteredTotal = useMemo(() => filtered.reduce((sum, e) => sum + e.amount, 0), [filtered])

  const categorySummary = useMemo(() => {
    const map = {}
    filtered.forEach(e => {
      if (!map[e.category]) map[e.category] = 0
      map[e.category] += e.amount
    })
    return Object.entries(map)
      .map(([cat, total]) => ({ category: cat, total, pct: filteredTotal > 0 ? (total / filteredTotal) * 100 : 0 }))
      .sort((a, b) => b.total - a.total)
  }, [filtered, filteredTotal])

  const monthlyBreakdown = useMemo(() => {
    const map = {}
    filtered.forEach(e => {
      const key = getMonthKey(e.date)
      if (!map[key]) map[key] = 0
      map[key] += e.amount
    })
    return Object.entries(map)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => {
        const da = new Date(a.month + ' 1')
        const db = new Date(b.month + ' 1')
        return db - da
      })
  }, [filtered])

  return (
    <ToolLayout
      title="Expense & Deduction Tracker"
      description="Track business expenses, view category breakdowns, and estimate tax savings."
      category="Revenue & Growth"
      icon="🧾"
    >
      <div id="expense-export">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Add/Edit Expense */}
          <div className="lg:col-span-1 space-y-6">
            <ResultCard title={editingId ? 'Edit Expense' : 'Add Expense'} icon="➕">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g., Adobe Creative Cloud"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={!description || !amount || !date}
                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all disabled:opacity-40"
                    style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                  >
                    {editingId ? 'Update' : 'Add Expense'}
                  </button>
                  {editingId && (
                    <button onClick={resetForm} className="px-3 py-2.5 text-sm rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-body)' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </ResultCard>

            {/* YTD & Tax Savings */}
            <div className="rounded-xl p-5" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Year-to-Date Expenses</p>
              <p className="text-3xl font-bold mb-4" style={{ color: 'var(--accent)' }}>{fmt(ytdTotal)}</p>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>Estimated Tax Savings</p>
              <div className="space-y-2">
                {TAX_BRACKETS.map(b => (
                  <div key={b.rate} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>At {b.label} bracket</span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>{fmt(ytdTotal * (b.rate / 100))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Lists and Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <ResultCard title="Filters" icon="🔍">
              <div className="flex flex-wrap gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Category</label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>From</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={e => setFilterDateFrom(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>To</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={e => setFilterDateTo(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  />
                </div>
                {(filterCategory !== 'All' || filterDateFrom || filterDateTo) && (
                  <div className="flex items-end">
                    <button
                      onClick={() => { setFilterCategory('All'); setFilterDateFrom(''); setFilterDateTo('') }}
                      className="px-3 py-2 text-xs rounded-lg"
                      style={{ color: 'var(--danger)', background: 'var(--danger-soft)' }}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Showing {filtered.length} expense{filtered.length !== 1 ? 's' : ''} totaling <span style={{ color: 'var(--text-heading)', fontWeight: 600 }}>{fmt(filteredTotal)}</span>
              </p>
            </ResultCard>

            {/* Category Breakdown */}
            {categorySummary.length > 0 && (
              <ResultCard title="Category Breakdown" icon="📊">
                <div className="space-y-3">
                  {categorySummary.map(item => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ background: CATEGORY_COLORS[item.category] || 'var(--text-muted)' }} />
                          <span className="text-sm" style={{ color: 'var(--text-heading)' }}>{item.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.pct.toFixed(1)}%</span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>{fmt(item.total)}</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%`, background: CATEGORY_COLORS[item.category] || 'var(--text-muted)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}

            {/* Monthly Breakdown */}
            {monthlyBreakdown.length > 0 && (
              <ResultCard title="Monthly Breakdown" icon="📅">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {monthlyBreakdown.map(item => (
                    <div key={item.month} className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.month}</p>
                      <p className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{fmt(item.total)}</p>
                    </div>
                  ))}
                </div>
              </ResultCard>
            )}

            {/* Expense List */}
            <ResultCard title="All Expenses" icon="📝">
              {filtered.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No expenses yet. Add your first expense to get started.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Date</th>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Description</th>
                        <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Category</th>
                        <th className="text-right py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Amount</th>
                        <th className="text-right py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(e => (
                        <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="py-2 px-2" style={{ color: 'var(--text-muted)' }}>
                            {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </td>
                          <td className="py-2 px-2" style={{ color: 'var(--text-heading)' }}>{e.description}</td>
                          <td className="py-2 px-2">
                            <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                              style={{ background: `${CATEGORY_COLORS[e.category] || 'var(--text-muted)'}18`, color: CATEGORY_COLORS[e.category] || 'var(--text-muted)' }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: CATEGORY_COLORS[e.category] || 'var(--text-muted)' }} />
                              {e.category}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right font-medium" style={{ color: 'var(--text-heading)' }}>{fmt(e.amount)}</td>
                          <td className="py-2 px-2 text-right">
                            <button onClick={() => handleEdit(e)} className="text-xs px-2 py-1 mr-1 rounded" style={{ color: 'var(--info)' }}>Edit</button>
                            <button onClick={() => handleDelete(e.id)} className="text-xs px-2 py-1 rounded" style={{ color: 'var(--danger)' }}>Del</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ResultCard>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ExportButton elementId="expense-export" filename="expense-report.pdf" label="Export PDF" />
        <ShareButton getShareURL={() => window.location.origin + '/expense-tracker'} />
      </div>
    </ToolLayout>
  )
}
