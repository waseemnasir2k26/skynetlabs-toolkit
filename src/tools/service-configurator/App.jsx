import React, { useState, useMemo } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { jsPDF } from 'jspdf'

const emptyService = { id: '', name: '', description: '', basePrice: '', timeline: '' }
const emptyAddon = { id: '', name: '', description: '', price: '', time: '' }
const emptyRevisionPkg = { id: '', name: '', revisions: '', price: '' }
const emptyDiscount = { id: '', name: '', type: 'percentage', value: '', minSpend: '' }

export default function App() {
  const [config, setConfig] = useLocalStorage('skynet-service-config', {
    services: [],
    addons: [],
    rushMultipliers: [{ label: '1.5x Rush', value: 1.5 }, { label: '2x Rush', value: 2 }],
    revisionPackages: [],
    discountRules: []
  })

  const [mode, setMode] = useState('setup') // setup | client
  const [editingService, setEditingService] = useState(null)
  const [editingAddon, setEditingAddon] = useState(null)
  const [editingRevision, setEditingRevision] = useState(null)
  const [editingDiscount, setEditingDiscount] = useState(null)

  // Client selections
  const [selectedService, setSelectedService] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [rushMultiplier, setRushMultiplier] = useState(1)
  const [selectedRevision, setSelectedRevision] = useState(null)
  const [showQuote, setShowQuote] = useState(false)

  const updateConfig = (key, value) => setConfig(prev => ({ ...prev, [key]: value }))

  // CRUD helpers
  const saveService = (svc) => {
    const item = { ...svc, id: svc.id || crypto.randomUUID(), basePrice: parseFloat(svc.basePrice) || 0, timeline: parseInt(svc.timeline) || 0 }
    updateConfig('services', svc.id ? config.services.map(s => s.id === svc.id ? item : s) : [...config.services, item])
    setEditingService(null)
  }

  const deleteService = (id) => {
    updateConfig('services', config.services.filter(s => s.id !== id))
    if (selectedService === id) setSelectedService(null)
  }

  const saveAddon = (addon) => {
    const item = { ...addon, id: addon.id || crypto.randomUUID(), price: parseFloat(addon.price) || 0, time: parseInt(addon.time) || 0 }
    updateConfig('addons', addon.id ? config.addons.map(a => a.id === addon.id ? item : a) : [...config.addons, item])
    setEditingAddon(null)
  }

  const deleteAddon = (id) => {
    updateConfig('addons', config.addons.filter(a => a.id !== id))
    setSelectedAddons(prev => prev.filter(x => x !== id))
  }

  const saveRevision = (rev) => {
    const item = { ...rev, id: rev.id || crypto.randomUUID(), revisions: parseInt(rev.revisions) || 0, price: parseFloat(rev.price) || 0 }
    updateConfig('revisionPackages', rev.id ? config.revisionPackages.map(r => r.id === rev.id ? item : r) : [...config.revisionPackages, item])
    setEditingRevision(null)
  }

  const deleteRevision = (id) => {
    updateConfig('revisionPackages', config.revisionPackages.filter(r => r.id !== id))
    if (selectedRevision === id) setSelectedRevision(null)
  }

  const saveDiscount = (disc) => {
    const item = { ...disc, id: disc.id || crypto.randomUUID(), value: parseFloat(disc.value) || 0, minSpend: parseFloat(disc.minSpend) || 0 }
    updateConfig('discountRules', disc.id ? config.discountRules.map(d => d.id === disc.id ? item : d) : [...config.discountRules, item])
    setEditingDiscount(null)
  }

  const deleteDiscount = (id) => {
    updateConfig('discountRules', config.discountRules.filter(d => d.id !== id))
  }

  // Quote calculation
  const quote = useMemo(() => {
    const baseService = config.services.find(s => s.id === selectedService)
    if (!baseService) return null

    let subtotal = baseService.basePrice
    let totalTime = baseService.timeline
    const lineItems = [{ label: baseService.name, price: baseService.basePrice, time: baseService.timeline }]

    const activeAddons = config.addons.filter(a => selectedAddons.includes(a.id))
    activeAddons.forEach(a => {
      subtotal += a.price
      totalTime += a.time
      lineItems.push({ label: `+ ${a.name}`, price: a.price, time: a.time })
    })

    const revPkg = config.revisionPackages.find(r => r.id === selectedRevision)
    if (revPkg) {
      subtotal += revPkg.price
      lineItems.push({ label: `Revisions: ${revPkg.name}`, price: revPkg.price })
    }

    if (rushMultiplier > 1) {
      const rushExtra = subtotal * (rushMultiplier - 1)
      subtotal += rushExtra
      totalTime = Math.ceil(totalTime / rushMultiplier)
      lineItems.push({ label: `Rush Delivery (${rushMultiplier}x)`, price: rushExtra })
    }

    let discount = 0
    let discountLabel = ''
    config.discountRules.forEach(d => {
      if (subtotal >= d.minSpend) {
        const amt = d.type === 'percentage' ? subtotal * (d.value / 100) : d.value
        if (amt > discount) {
          discount = amt
          discountLabel = d.name
        }
      }
    })

    const total = subtotal - discount

    return { lineItems, subtotal, discount, discountLabel, total, totalTime, baseService }
  }, [selectedService, selectedAddons, rushMultiplier, selectedRevision, config])

  const exportQuotePDF = () => {
    if (!quote) return
    const doc = new jsPDF()
    let y = 20
    const lm = 20

    doc.setFontSize(20)
    doc.setTextColor(19, 185, 115)
    doc.text('Service Quote', lm, y); y += 10
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, lm, y); y += 12

    doc.setFontSize(12)
    doc.setTextColor(40)
    doc.text('Line Items', lm, y); y += 8

    doc.setFontSize(10)
    doc.setTextColor(80)
    quote.lineItems.forEach(item => {
      const priceStr = `$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      doc.text(item.label, lm, y)
      doc.text(priceStr, 170, y, { align: 'right' })
      if (item.time) doc.text(`(${item.time}d)`, 140, y, { align: 'right' })
      y += 6
    })

    y += 4
    doc.setDrawColor(200)
    doc.line(lm, y, 190, y); y += 6

    if (quote.discount > 0) {
      doc.setTextColor(19, 185, 115)
      doc.text(`Discount: ${quote.discountLabel}`, lm, y)
      doc.text(`-$${quote.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' })
      y += 6
    }

    doc.setFontSize(14)
    doc.setTextColor(40)
    doc.text('Total:', lm, y)
    doc.setTextColor(19, 185, 115)
    doc.text(`$${quote.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 170, y, { align: 'right' })
    y += 8
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Estimated Timeline: ${quote.totalTime} days`, lm, y)

    doc.save('service-quote.pdf')
  }

  const inputClass = 'w-full bg-dark-200/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-colors'
  const btnPrimary = 'px-4 py-2 bg-primary hover:bg-primary-light text-black font-medium rounded-lg transition-colors text-sm'
  const btnSecondary = 'px-3 py-1.5 bg-dark-200/50 hover:bg-dark-200 text-gray-300 hover:text-white border border-white/10 rounded-lg transition-colors text-sm'

  const InlineForm = ({ fields, data, onSave, onCancel }) => {
    const [form, setForm] = useState({ ...data })
    return (
      <div className="bg-dark-200/30 rounded-lg p-4 space-y-3">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-gray-400 text-xs mb-1">{f.label}</label>
            {f.type === 'select' ? (
              <select className={inputClass} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea className={inputClass + ' min-h-[60px]'} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            ) : (
              <input type={f.type || 'text'} className={inputClass} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={() => onSave(form)} className={btnPrimary + ' text-xs'}>Save</button>
          <button onClick={onCancel} className={btnSecondary + ' text-xs'}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <ToolLayout
      title="Interactive Services Configurator"
      description="Build service packages with add-ons, rush pricing, and discounts. Let clients configure and get instant quotes."
    >
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode('setup')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'setup' ? 'bg-primary text-black' : 'bg-dark-100/50 text-gray-400 hover:text-white border border-white/10'}`}>
          Setup Mode
        </button>
        <button onClick={() => setMode('client')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'client' ? 'bg-primary text-black' : 'bg-dark-100/50 text-gray-400 hover:text-white border border-white/10'}`}>
          Client Preview
        </button>
      </div>

      {mode === 'setup' && (
        <div className="space-y-6">
          {/* Base Services */}
          <ResultCard title="Base Services" icon="&#128230;">
            <div className="space-y-3">
              {config.services.map(svc => (
                <div key={svc.id} className="flex items-center justify-between bg-dark-200/30 rounded-lg p-3">
                  <div>
                    <p className="text-white text-sm font-medium">{svc.name}</p>
                    <p className="text-gray-400 text-xs">{svc.description}</p>
                    <p className="text-primary text-sm mt-1">${svc.basePrice.toLocaleString()} &middot; {svc.timeline}d</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingService(svc)} className="text-primary text-xs hover:text-primary-light">Edit</button>
                    <button onClick={() => deleteService(svc.id)} className="text-gray-500 text-xs hover:text-red-400">Delete</button>
                  </div>
                </div>
              ))}
              {editingService !== null ? (
                <InlineForm
                  data={editingService}
                  fields={[
                    { key: 'name', label: 'Service Name', placeholder: 'e.g. Website Design' },
                    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What this service includes...' },
                    { key: 'basePrice', label: 'Base Price ($)', type: 'number', placeholder: '2500' },
                    { key: 'timeline', label: 'Timeline (days)', type: 'number', placeholder: '14' }
                  ]}
                  onSave={saveService}
                  onCancel={() => setEditingService(null)}
                />
              ) : (
                <button onClick={() => setEditingService({ ...emptyService })} className={btnSecondary}>+ Add Service</button>
              )}
            </div>
          </ResultCard>

          {/* Add-on Modules */}
          <ResultCard title="Add-on Modules" icon="&#128296;">
            <div className="space-y-3">
              {config.addons.map(addon => (
                <div key={addon.id} className="flex items-center justify-between bg-dark-200/30 rounded-lg p-3">
                  <div>
                    <p className="text-white text-sm font-medium">{addon.name}</p>
                    <p className="text-gray-400 text-xs">{addon.description}</p>
                    <p className="text-primary text-sm mt-1">+${addon.price.toLocaleString()} &middot; +{addon.time}d</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingAddon(addon)} className="text-primary text-xs hover:text-primary-light">Edit</button>
                    <button onClick={() => deleteAddon(addon.id)} className="text-gray-500 text-xs hover:text-red-400">Delete</button>
                  </div>
                </div>
              ))}
              {editingAddon !== null ? (
                <InlineForm
                  data={editingAddon}
                  fields={[
                    { key: 'name', label: 'Add-on Name', placeholder: 'e.g. SEO Optimization' },
                    { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What this add-on includes...' },
                    { key: 'price', label: 'Additional Price ($)', type: 'number', placeholder: '500' },
                    { key: 'time', label: 'Additional Time (days)', type: 'number', placeholder: '3' }
                  ]}
                  onSave={saveAddon}
                  onCancel={() => setEditingAddon(null)}
                />
              ) : (
                <button onClick={() => setEditingAddon({ ...emptyAddon })} className={btnSecondary}>+ Add Module</button>
              )}
            </div>
          </ResultCard>

          {/* Rush Multipliers */}
          <ResultCard title="Rush Multipliers" icon="&#9889;">
            <div className="flex flex-wrap gap-3">
              {config.rushMultipliers.map((rm, i) => (
                <div key={i} className="bg-dark-200/30 rounded-lg px-4 py-2 text-center">
                  <p className="text-white text-sm font-medium">{rm.label}</p>
                  <p className="text-yellow-400 text-xs">{rm.value}x price</p>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2">Rush delivery multiplies the price and reduces the timeline proportionally.</p>
          </ResultCard>

          {/* Revision Packages */}
          <ResultCard title="Revision Packages" icon="&#128260;">
            <div className="space-y-3">
              {config.revisionPackages.map(rev => (
                <div key={rev.id} className="flex items-center justify-between bg-dark-200/30 rounded-lg p-3">
                  <div>
                    <p className="text-white text-sm font-medium">{rev.name}</p>
                    <p className="text-gray-400 text-xs">{rev.revisions} revisions &middot; ${rev.price.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingRevision(rev)} className="text-primary text-xs hover:text-primary-light">Edit</button>
                    <button onClick={() => deleteRevision(rev.id)} className="text-gray-500 text-xs hover:text-red-400">Delete</button>
                  </div>
                </div>
              ))}
              {editingRevision !== null ? (
                <InlineForm
                  data={editingRevision}
                  fields={[
                    { key: 'name', label: 'Package Name', placeholder: 'e.g. Standard Revisions' },
                    { key: 'revisions', label: 'Number of Revisions', type: 'number', placeholder: '3' },
                    { key: 'price', label: 'Price ($)', type: 'number', placeholder: '200' }
                  ]}
                  onSave={saveRevision}
                  onCancel={() => setEditingRevision(null)}
                />
              ) : (
                <button onClick={() => setEditingRevision({ ...emptyRevisionPkg })} className={btnSecondary}>+ Add Package</button>
              )}
            </div>
          </ResultCard>

          {/* Discount Rules */}
          <ResultCard title="Discount Rules" icon="&#127991;">
            <div className="space-y-3">
              {config.discountRules.map(disc => (
                <div key={disc.id} className="flex items-center justify-between bg-dark-200/30 rounded-lg p-3">
                  <div>
                    <p className="text-white text-sm font-medium">{disc.name}</p>
                    <p className="text-gray-400 text-xs">
                      {disc.type === 'percentage' ? `${disc.value}% off` : `$${disc.value} off`} when spending ${disc.minSpend}+
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingDiscount(disc)} className="text-primary text-xs hover:text-primary-light">Edit</button>
                    <button onClick={() => deleteDiscount(disc.id)} className="text-gray-500 text-xs hover:text-red-400">Delete</button>
                  </div>
                </div>
              ))}
              {editingDiscount !== null ? (
                <InlineForm
                  data={editingDiscount}
                  fields={[
                    { key: 'name', label: 'Rule Name', placeholder: 'e.g. Bundle Discount' },
                    { key: 'type', label: 'Discount Type', type: 'select', options: [{ value: 'percentage', label: 'Percentage' }, { value: 'flat', label: 'Flat Amount' }] },
                    { key: 'value', label: 'Value', type: 'number', placeholder: '10' },
                    { key: 'minSpend', label: 'Minimum Spend ($)', type: 'number', placeholder: '5000' }
                  ]}
                  onSave={saveDiscount}
                  onCancel={() => setEditingDiscount(null)}
                />
              ) : (
                <button onClick={() => setEditingDiscount({ ...emptyDiscount })} className={btnSecondary}>+ Add Rule</button>
              )}
            </div>
          </ResultCard>
        </div>
      )}

      {mode === 'client' && (
        <div className="space-y-6">
          {config.services.length === 0 ? (
            <ResultCard>
              <p className="text-gray-400 text-center py-8">No services configured yet. Switch to Setup Mode to add services.</p>
            </ResultCard>
          ) : (
            <>
              {/* Choose Base Service */}
              <ResultCard title="Choose Your Service" icon="&#128640;">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.services.map(svc => (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedService(svc.id === selectedService ? null : svc.id)}
                      className={`text-left rounded-xl p-4 border-2 transition-all ${selectedService === svc.id ? 'border-primary bg-primary/5' : 'border-white/10 bg-dark-200/30 hover:border-white/20'}`}
                    >
                      <h4 className="text-white font-semibold">{svc.name}</h4>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{svc.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-primary text-lg font-bold">${svc.basePrice.toLocaleString()}</span>
                        <span className="text-gray-500 text-sm">{svc.timeline} days</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ResultCard>

              {/* Add-ons */}
              {config.addons.length > 0 && selectedService && (
                <ResultCard title="Add-on Modules" icon="&#128296;">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.addons.map(addon => {
                      const active = selectedAddons.includes(addon.id)
                      return (
                        <button
                          key={addon.id}
                          onClick={() => setSelectedAddons(prev => active ? prev.filter(x => x !== addon.id) : [...prev, addon.id])}
                          className={`text-left rounded-lg p-3 border transition-all ${active ? 'border-primary bg-primary/5' : 'border-white/10 bg-dark-200/30 hover:border-white/20'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm font-medium">{addon.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-primary/20 text-primary' : 'bg-dark-200 text-gray-400'}`}>
                              {active ? 'Added' : `+$${addon.price.toLocaleString()}`}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">{addon.description}</p>
                          <p className="text-gray-500 text-xs mt-1">+{addon.time} days</p>
                        </button>
                      )
                    })}
                  </div>
                </ResultCard>
              )}

              {/* Rush Delivery */}
              {selectedService && (
                <ResultCard title="Rush Delivery" icon="&#9889;">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setRushMultiplier(1)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${rushMultiplier === 1 ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-200/30 text-gray-400 border border-white/10'}`}
                    >
                      Standard
                    </button>
                    {config.rushMultipliers.map((rm, i) => (
                      <button
                        key={i}
                        onClick={() => setRushMultiplier(rm.value)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${rushMultiplier === rm.value ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-dark-200/30 text-gray-400 border border-white/10'}`}
                      >
                        {rm.label}
                      </button>
                    ))}
                  </div>
                </ResultCard>
              )}

              {/* Revision Package */}
              {selectedService && config.revisionPackages.length > 0 && (
                <ResultCard title="Revision Package" icon="&#128260;">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedRevision(null)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedRevision === null ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-200/30 text-gray-400 border border-white/10'}`}
                    >
                      None
                    </button>
                    {config.revisionPackages.map(rev => (
                      <button
                        key={rev.id}
                        onClick={() => setSelectedRevision(rev.id === selectedRevision ? null : rev.id)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedRevision === rev.id ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-200/30 text-gray-400 border border-white/10'}`}
                      >
                        {rev.name} ({rev.revisions} revisions) +${rev.price.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </ResultCard>
              )}

              {/* Sticky Running Total */}
              {quote && (
                <div className="sticky bottom-0 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-[#0a0a0f]/95 backdrop-blur border-t border-white/10">
                  <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6 flex-wrap">
                      <div>
                        <p className="text-gray-400 text-xs uppercase">Total</p>
                        <p className="text-primary text-2xl font-bold">${quote.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase">Timeline</p>
                        <p className="text-white text-lg font-semibold">{quote.totalTime} days</p>
                      </div>
                      {quote.discount > 0 && (
                        <div>
                          <p className="text-gray-400 text-xs uppercase">Savings</p>
                          <p className="text-green-400 text-lg font-semibold">-${quote.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setShowQuote(!showQuote)} className={btnSecondary}>
                        {showQuote ? 'Hide Breakdown' : 'Get Your Quote'}
                      </button>
                      <button onClick={exportQuotePDF} className={btnPrimary}>Export PDF</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quote Breakdown */}
              {showQuote && quote && (
                <ResultCard title="Quote Summary" icon="&#128203;" className="mt-4">
                  <div className="space-y-2">
                    {quote.lineItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-gray-300 text-sm">{item.label}</p>
                          {item.time && <p className="text-gray-500 text-xs">{item.time} days</p>}
                        </div>
                        <p className="text-white font-medium">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                    ))}
                    {quote.discount > 0 && (
                      <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <p className="text-green-400 text-sm">Discount: {quote.discountLabel}</p>
                        <p className="text-green-400 font-medium">-${quote.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3">
                      <p className="text-white font-bold text-lg">Total</p>
                      <p className="text-primary font-bold text-xl">${quote.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                    <p className="text-gray-500 text-sm text-center pt-2">Estimated delivery: {quote.totalTime} days</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <CopyButton text={quote.lineItems.map(i => `${i.label}: $${i.price}`).join('\n') + `\nTotal: $${quote.total}`} label="Copy Quote" />
                  </div>
                </ResultCard>
              )}
            </>
          )}
        </div>
      )}
    </ToolLayout>
  )
}
