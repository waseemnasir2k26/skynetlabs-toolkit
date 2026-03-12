import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'
import { generateId } from '../shared/utils'
import { useToast } from '../shared/Toast'

const PROJECT_TYPES = [
  'Website',
  'Web App',
  'Mobile App',
  'Branding',
  'Marketing Campaign',
  'SEO',
  'Social Media Management',
  'Video Production',
  'Consulting',
  'Other',
]

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n || 0)
}

export default function App() {
  const toast = useToast()
  const [projectType, setProjectType] = useLocalStorage('skynet-pricing-calc-type', 'Website')
  const [markupPct, setMarkupPct] = useLocalStorage('skynet-pricing-calc-markup', 20)
  const [discountPct, setDiscountPct] = useLocalStorage('skynet-pricing-calc-discount', 0)
  const [rushFee, setRushFee] = useLocalStorage('skynet-pricing-calc-rush', false)
  const [confidence, setConfidence] = useLocalStorage('skynet-pricing-calc-confidence', 70)
  const [lineItems, setLineItems] = useLocalStorage('skynet-pricing-calc-items', [])

  const [taskDesc, setTaskDesc] = useState('')
  const [taskHours, setTaskHours] = useState('')
  const [taskRate, setTaskRate] = useState('')
  const [editingId, setEditingId] = useState(null)

  const { generateShareURL } = useShareableURL(
    { projectType, markupPct, discountPct, confidence },
    {
      projectType: setProjectType,
      markupPct: (v) => setMarkupPct(Number(v)),
      discountPct: (v) => setDiscountPct(Number(v)),
      confidence: (v) => setConfidence(Number(v)),
    }
  )

  const resetItemForm = () => {
    setEditingId(null)
    setTaskDesc('')
    setTaskHours('')
    setTaskRate('')
  }

  const handleSaveItem = () => {
    if (!taskDesc || !taskHours || !taskRate) return
    const hours = parseFloat(taskHours)
    const rate = parseFloat(taskRate)
    if (isNaN(hours) || isNaN(rate)) return

    if (editingId) {
      setLineItems(prev => prev.map(item =>
        item.id === editingId ? { ...item, description: taskDesc, hours, rate } : item
      ))
      if (toast) toast('Line item updated', 'success')
    } else {
      setLineItems(prev => [...prev, { id: generateId(), description: taskDesc, hours, rate }])
      if (toast) toast('Line item added', 'success')
    }
    resetItemForm()
  }

  const handleEditItem = (item) => {
    setEditingId(item.id)
    setTaskDesc(item.description)
    setTaskHours(String(item.hours))
    setTaskRate(String(item.rate))
  }

  const handleDeleteItem = (id) => {
    setLineItems(prev => prev.filter(item => item.id !== id))
    if (editingId === id) resetItemForm()
    if (toast) toast('Line item removed', 'info')
  }

  const calc = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.hours * item.rate, 0)
    const totalHours = lineItems.reduce((sum, item) => sum + item.hours, 0)
    const markup = subtotal * (markupPct / 100)
    const afterMarkup = subtotal + markup
    const rush = rushFee ? afterMarkup * 0.25 : 0
    const afterRush = afterMarkup + rush
    const discount = afterRush * (discountPct / 100)
    const finalPrice = afterRush - discount

    const confidenceFactor = confidence / 100
    const rangeLow = finalPrice * (0.85 + confidenceFactor * 0.1)
    const rangeHigh = finalPrice * (1.05 + (1 - confidenceFactor) * 0.15)

    const goodItems = lineItems.filter((_, i) => i < Math.ceil(lineItems.length * 0.6))
    const betterItems = lineItems.filter((_, i) => i < Math.ceil(lineItems.length * 0.85))
    const bestItems = lineItems

    const goodSubtotal = goodItems.reduce((s, it) => s + it.hours * it.rate, 0)
    const betterSubtotal = betterItems.reduce((s, it) => s + it.hours * it.rate, 0)
    const bestSubtotal = bestItems.reduce((s, it) => s + it.hours * it.rate, 0)

    const applyFees = (base) => {
      const m = base * (markupPct / 100)
      const afterM = base + m
      const r = rushFee ? afterM * 0.25 : 0
      const afterR = afterM + r
      const d = afterR * (discountPct / 100)
      return afterR - d
    }

    return {
      subtotal,
      totalHours,
      markup,
      rush,
      discount,
      finalPrice,
      rangeLow,
      rangeHigh,
      good: { items: goodItems, price: applyFees(goodSubtotal) },
      better: { items: betterItems, price: applyFees(betterSubtotal) },
      best: { items: bestItems, price: applyFees(bestSubtotal) },
    }
  }, [lineItems, markupPct, discountPct, rushFee, confidence])

  const confidenceLabel = confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low'
  const confidenceColor = confidence >= 80 ? 'var(--success)' : confidence >= 50 ? 'var(--warning)' : 'var(--danger)'

  return (
    <ToolLayout
      title="Proposal Pricing Calculator"
      description="Build detailed project pricing with line items, markup, and Good/Better/Best package options."
      category="Revenue & Growth"
      icon="💰"
    >
      <div id="pricing-export">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Inputs */}
          <div className="space-y-6">
            <ResultCard title="Project Setup" icon="📋">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Project Type</label>
                  <select
                    value={projectType}
                    onChange={e => setProjectType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  >
                    {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Agency Markup %</label>
                    <input
                      type="number"
                      value={markupPct}
                      onChange={e => setMarkupPct(Math.max(0, parseFloat(e.target.value) || 0))}
                      min="0"
                      max="200"
                      className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Discount %</label>
                    <input
                      type="number"
                      value={discountPct}
                      onChange={e => setDiscountPct(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <input type="checkbox" checked={rushFee} onChange={e => setRushFee(e.target.checked)} />
                  <span className="text-sm" style={{ color: 'var(--text-heading)' }}>Rush Fee (+25%)</span>
                  {rushFee && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--warning-soft, var(--accent-soft))', color: 'var(--warning)' }}>Active</span>}
                </label>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Price Confidence</label>
                    <span className="text-xs font-semibold" style={{ color: confidenceColor }}>{confidence}% ({confidenceLabel})</span>
                  </div>
                  <input
                    type="range"
                    value={confidence}
                    onChange={e => setConfidence(parseInt(e.target.value))}
                    min="10"
                    max="100"
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: confidenceColor, background: 'var(--bg-card)' }}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {confidence >= 80
                      ? 'You know this market well. Tight price range.'
                      : confidence >= 50
                        ? 'Some uncertainty. Moderate price range shown.'
                        : 'High uncertainty. Wide suggested range.'}
                  </p>
                </div>
              </div>
            </ResultCard>

            {/* Add Line Items */}
            <ResultCard title={editingId ? 'Edit Line Item' : 'Add Service Line Item'} icon="🔧">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Task Description</label>
                  <input
                    type="text"
                    value={taskDesc}
                    onChange={e => setTaskDesc(e.target.value)}
                    placeholder="e.g., Homepage design & development"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Est. Hours</label>
                    <input
                      type="number"
                      value={taskHours}
                      onChange={e => setTaskHours(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Hourly Rate ($)</label>
                    <input
                      type="number"
                      value={taskRate}
                      onChange={e => setTaskRate(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="5"
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveItem}
                    disabled={!taskDesc || !taskHours || !taskRate}
                    className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg disabled:opacity-40 transition-all"
                    style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
                  >
                    {editingId ? 'Update Item' : 'Add Item'}
                  </button>
                  {editingId && (
                    <button onClick={resetItemForm} className="px-3 py-2.5 text-sm rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-body)' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </ResultCard>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-6">
            {/* Line Items Table */}
            <ResultCard title="Service Line Items" icon="📝">
              {lineItems.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No line items added yet.</p>
              ) : (
                <div className="space-y-2">
                  {lineItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <span className="text-xs font-mono w-5 text-center" style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: 'var(--text-heading)' }}>{item.description}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.hours}h x {fmt(item.rate)}/hr</p>
                      </div>
                      <span className="font-semibold text-sm flex-shrink-0" style={{ color: 'var(--accent)' }}>{fmt(item.hours * item.rate)}</span>
                      <button onClick={() => handleEditItem(item)} className="text-xs" style={{ color: 'var(--info)' }}>Edit</button>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-xs" style={{ color: 'var(--danger)' }}>Del</button>
                    </div>
                  ))}
                </div>
              )}
            </ResultCard>

            {/* Price Summary */}
            {lineItems.length > 0 && (
              <ResultCard title="Price Summary" icon="💵">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal ({calc.totalHours}h)</span>
                    <span style={{ color: 'var(--text-heading)' }}>{fmt(calc.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Agency Markup ({markupPct}%)</span>
                    <span style={{ color: 'var(--text-heading)' }}>+{fmt(calc.markup)}</span>
                  </div>
                  {rushFee && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--warning)' }}>Rush Fee (+25%)</span>
                      <span style={{ color: 'var(--warning)' }}>+{fmt(calc.rush)}</span>
                    </div>
                  )}
                  {discountPct > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--success)' }}>Discount ({discountPct}%)</span>
                      <span style={{ color: 'var(--success)' }}>-{fmt(calc.discount)}</span>
                    </div>
                  )}
                  <div className="pt-3 flex justify-between" style={{ borderTop: '2px solid var(--border)' }}>
                    <span className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>Total</span>
                    <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{fmt(calc.finalPrice)}</span>
                  </div>
                  <div className="rounded-lg px-4 py-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Suggested Price Range (based on {confidenceLabel.toLowerCase()} confidence)</p>
                    <p className="text-sm font-semibold" style={{ color: confidenceColor }}>
                      {fmt(calc.rangeLow)} - {fmt(calc.rangeHigh)}
                    </p>
                  </div>
                </div>
              </ResultCard>
            )}

            {/* Good/Better/Best Packages */}
            {lineItems.length >= 2 && (
              <ResultCard title="Package Options" icon="📦">
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  Present clients with three tiers using price anchoring. The "Best" option makes "Better" feel like a deal.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Good', sub: 'Core deliverables', data: calc.good, borderColor: 'var(--border)' },
                    { label: 'Better', sub: 'Core + enhancements', data: calc.better, borderColor: 'var(--accent)' },
                    { label: 'Best', sub: 'Everything + premium', data: calc.best, borderColor: 'var(--success)' },
                  ].map(pkg => (
                    <div
                      key={pkg.label}
                      className="rounded-xl p-4 text-center relative"
                      style={{ background: 'var(--bg-elevated)', border: `2px solid ${pkg.borderColor}` }}
                    >
                      {pkg.label === 'Better' && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
                          POPULAR
                        </span>
                      )}
                      <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-heading)' }}>{pkg.label}</p>
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{pkg.sub}</p>
                      <p className="text-2xl font-bold mb-2" style={{ color: 'var(--accent)' }}>{fmt(pkg.data.price)}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pkg.data.items.length} item{pkg.data.items.length !== 1 ? 's' : ''} included</p>
                      <div className="mt-3 space-y-1">
                        {pkg.data.items.map(item => (
                          <p key={item.id} className="text-xs truncate" style={{ color: 'var(--text-body)' }}>
                            &#10003; {item.description}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Anchoring */}
                <div className="mt-4 rounded-lg p-4" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>Price Anchoring Effect</p>
                  <p className="text-xs" style={{ color: 'var(--text-body)' }}>
                    The <strong>Best</strong> package at {fmt(calc.best.price)} makes the <strong>Better</strong> package at {fmt(calc.better.price)} feel like a bargain
                    ({((1 - calc.better.price / calc.best.price) * 100).toFixed(0)}% less). Most clients will choose Better, which is your sweet spot for profitability.
                  </p>
                </div>
              </ResultCard>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ExportButton elementId="pricing-export" filename="proposal-pricing.pdf" label="Export PDF" />
        <ShareButton getShareURL={generateShareURL} />
      </div>
    </ToolLayout>
  )
}
