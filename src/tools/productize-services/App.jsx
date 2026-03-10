import React, { useState, useMemo, useRef, useCallback } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const STEPS = [
  { num: 1, label: 'Your Service' },
  { num: 2, label: 'Core Tasks' },
  { num: 3, label: 'Variable Tasks' },
  { num: 4, label: 'Pricing' },
  { num: 5, label: 'Ideal Client' },
  { num: 6, label: 'Generated Packages' },
  { num: 7, label: 'Customize & Export' },
]

const emptyWizard = {
  serviceDescription: '',
  coreTasks: [],
  variableTasks: [],
  hourlyRate: '',
  avgProjectCost: '',
  idealClient: '',
  packages: null,
  customized: false,
}

function ChecklistBuilder({ items, setItems, placeholder }) {
  const [newItem, setNewItem] = useState('')

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: generateId(), text: newItem.trim() }])
      setNewItem('')
    }
  }

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addItem() }
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
          placeholder={placeholder}
        />
        <button onClick={addItem} className="px-4 py-3 rounded-xl font-medium transition-colors hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>Add</button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>No items added yet. Type above and click Add or press Enter.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={item.id} className="flex items-center gap-3 rounded-lg px-4 py-2.5 group" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <span className="text-sm font-mono w-6" style={{ color: 'var(--accent)' }}>{idx + 1}.</span>
              <span className="text-sm flex-1" style={{ color: 'var(--text-body)' }}>{item.text}</span>
              <button onClick={() => removeItem(item.id)} className="transition-colors opacity-0 group-hover:opacity-100 hover:opacity-70" style={{ color: 'var(--danger)' }}>&times;</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function generatePackages(data) {
  const { coreTasks, variableTasks, hourlyRate, avgProjectCost } = data
  const rate = Number(hourlyRate) || 100
  const avgCost = Number(avgProjectCost) || rate * 20

  const coreItems = coreTasks.map((t) => t.text)
  const varItems = variableTasks.map((t) => t.text)
  const halfVars = varItems.slice(0, Math.ceil(varItems.length * 0.5))

  // Price tiers based on avg project cost
  const starterPrice = Math.round(avgCost * 0.6 / 50) * 50
  const proPrice = Math.round(avgCost * 1.0 / 50) * 50
  const premiumPrice = Math.round(avgCost * 1.6 / 50) * 50

  return [
    {
      id: 'starter',
      name: 'Starter',
      price: starterPrice,
      deliverables: [...coreItems],
      timeline: '1-2 weeks',
      exclusions: varItems.length > 0 ? varItems : ['Custom add-ons'],
      idealFor: 'Businesses just getting started who need the essentials done right.',
    },
    {
      id: 'professional',
      name: 'Professional',
      price: proPrice,
      deliverables: [...coreItems, ...halfVars],
      timeline: '2-3 weeks',
      exclusions: varItems.slice(Math.ceil(varItems.length * 0.5)),
      idealFor: 'Growing businesses who want a comprehensive solution with key extras.',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: premiumPrice,
      deliverables: [...coreItems, ...varItems],
      timeline: '3-4 weeks',
      exclusions: [],
      idealFor: 'Established businesses who want the full white-glove experience.',
    },
  ]
}

function PackageCard({ pkg, editable, onUpdate }) {
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }
  const inputClass = "w-full rounded-xl px-4 py-2.5 placeholder-gray-500 focus:outline-none text-sm"

  const tierBorderColors = {
    starter: 'var(--text-muted)',
    professional: 'var(--accent)',
    premium: 'var(--warning)',
  }

  const tierBadgeStyles = {
    starter: { background: 'var(--bg-elevated)', color: 'var(--text-muted)' },
    professional: { background: 'var(--accent-soft)', color: 'var(--accent)' },
    premium: { background: 'var(--warning-soft)', color: 'var(--warning)' },
  }

  if (editable) {
    return (
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-elevated)', borderLeft: `3px solid ${tierBorderColors[pkg.id] || 'var(--border)'}`, border: `1px solid var(--border)` }}>
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={pkg.name}
            onChange={(e) => onUpdate({ ...pkg, name: e.target.value })}
            className="bg-transparent font-bold text-xl focus:outline-none"
            style={{ color: 'var(--text-heading)' }}
          />
          <div className="flex items-center gap-1">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
            <input
              type="number"
              value={pkg.price}
              onChange={(e) => onUpdate({ ...pkg, price: Number(e.target.value) })}
              className="w-24 bg-transparent font-bold text-2xl focus:outline-none text-right"
              style={{ color: 'var(--accent)' }}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Timeline</label>
          <input type="text" value={pkg.timeline} onChange={(e) => onUpdate({ ...pkg, timeline: e.target.value })} className={inputClass} style={inputStyle} />
        </div>

        <div className="mb-3">
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Ideal For</label>
          <textarea value={pkg.idealFor} onChange={(e) => onUpdate({ ...pkg, idealFor: e.target.value })} rows={2} className={`${inputClass} resize-none`} style={inputStyle} />
        </div>

        <div className="mb-3">
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Deliverables (one per line)</label>
          <textarea
            value={pkg.deliverables.join('\n')}
            onChange={(e) => onUpdate({ ...pkg, deliverables: e.target.value.split('\n') })}
            rows={Math.max(3, pkg.deliverables.length)}
            className={`${inputClass} resize-none font-mono`}
            style={inputStyle}
          />
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Exclusions (one per line)</label>
          <textarea
            value={pkg.exclusions.join('\n')}
            onChange={(e) => onUpdate({ ...pkg, exclusions: e.target.value.split('\n').filter(Boolean) })}
            rows={Math.max(2, pkg.exclusions.length || 1)}
            className={`${inputClass} resize-none font-mono`}
            style={inputStyle}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-elevated)', border: `1px solid var(--border)` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="px-2.5 py-0.5 text-xs rounded-full font-medium" style={tierBadgeStyles[pkg.id] || tierBadgeStyles.starter}>{pkg.name}</span>
        </div>
        <p className="font-bold text-2xl" style={{ color: 'var(--accent)' }}>${pkg.price.toLocaleString()}</p>
      </div>
      <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Timeline: <span style={{ color: 'var(--text-body)' }}>{pkg.timeline}</span></p>
      <p className="text-sm mb-4 italic" style={{ color: 'var(--text-muted)' }}>{pkg.idealFor}</p>

      <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-heading)' }}>Deliverables</h4>
      <ul className="space-y-1.5 mb-4">
        {pkg.deliverables.map((d, i) => (
          <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-body)' }}>
            <span className="mt-0.5" style={{ color: 'var(--accent)' }}>{'\u2713'}</span> {d}
          </li>
        ))}
      </ul>

      {pkg.exclusions.length > 0 && (
        <>
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-heading)' }}>Not Included</h4>
          <ul className="space-y-1.5">
            {pkg.exclusions.map((e, i) => (
              <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                <span className="mt-0.5" style={{ color: 'var(--text-muted)' }}>{'\u2717'}</span> {e}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default function App() {
  const [wizardData, setWizardData] = useLocalStorage('skynet-productize-wizard', { ...emptyWizard })
  const [step, setStep] = useState(1)
  const exportRef = useRef(null)

  const updateWizard = (field, value) => setWizardData((d) => ({ ...d, [field]: value }))

  const goNext = () => {
    if (step === 5 && !wizardData.packages) {
      // Generate packages
      const pkgs = generatePackages(wizardData)
      setWizardData((d) => ({ ...d, packages: pkgs }))
    }
    setStep((s) => Math.min(s + 1, 7))
  }
  const goBack = () => setStep((s) => Math.max(s - 1, 1))

  const updatePackage = (idx, updated) => {
    setWizardData((d) => {
      const pkgs = [...(d.packages || [])]
      pkgs[idx] = updated
      return { ...d, packages: pkgs }
    })
  }

  const regenerate = () => {
    const pkgs = generatePackages(wizardData)
    setWizardData((d) => ({ ...d, packages: pkgs }))
  }

  const resetWizard = () => {
    setWizardData({ ...emptyWizard })
    setStep(1)
  }

  const exportPDF = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const el = exportRef.current
      if (!el) return
      const canvas = await html2canvas(el, { backgroundColor: document.documentElement.getAttribute('data-theme') === 'light' ? '#f4f5f7' : '#050507', scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      // Handle multi-page if content is long
      const pageHeight = pdf.internal.pageSize.getHeight()
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      } else {
        let position = 0
        while (position < pdfHeight) {
          if (position > 0) pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, pdfHeight)
          position += pageHeight
        }
      }
      pdf.save('service-packages.pdf')
    } catch (err) {
      console.error('PDF export failed:', err)
      alert('PDF export failed. Please try again.')
    }
  }, [])

  // Generate text for copy
  const packagesText = useMemo(() => {
    if (!wizardData.packages) return ''
    return wizardData.packages.map((pkg) =>
      `${pkg.name.toUpperCase()} - $${pkg.price.toLocaleString()}\n${'-'.repeat(30)}\nTimeline: ${pkg.timeline}\nIdeal For: ${pkg.idealFor}\n\nDeliverables:\n${pkg.deliverables.map((d) => `  - ${d}`).join('\n')}\n${pkg.exclusions.length > 0 ? `\nNot Included:\n${pkg.exclusions.map((e) => `  - ${e}`).join('\n')}` : ''}`
    ).join('\n\n' + '='.repeat(50) + '\n\n')
  }, [wizardData.packages])

  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return wizardData.serviceDescription.trim().length > 0
      case 2: return wizardData.coreTasks.length > 0
      case 3: return true // variable tasks are optional
      case 4: return Number(wizardData.hourlyRate) > 0
      case 5: return wizardData.idealClient.trim().length > 0
      default: return true
    }
  }, [step, wizardData])

  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }
  const inputClass = "w-full rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none"

  return (
    <ToolLayout title="Service Productization Workshop" description="Turn your custom services into scalable, packaged offerings with tiered pricing.">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s) => (
            <button
              key={s.num}
              onClick={() => { if (s.num <= step) setStep(s.num) }}
              className={`hidden sm:flex flex-col items-center gap-1 transition-all ${s.num <= step ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all" style={s.num === step ? { background: 'var(--accent)', color: 'var(--text-heading)' } : s.num < step ? { background: 'var(--accent-soft)', color: 'var(--accent)' } : { background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
                {s.num < step ? '\u2713' : s.num}
              </div>
              <span className="text-xs" style={{ color: s.num === step ? 'var(--text-heading)' : s.num < step ? 'var(--text-muted)' : 'var(--text-muted)' }}>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%`, background: 'var(--accent)' }} />
        </div>
        <p className="sm:hidden text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Step {step} of {STEPS.length}: {STEPS[step - 1].label}</p>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto">
        {step === 1 && (
          <ResultCard title="What service do you offer?" icon="\uD83D\uDCA1">
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Describe your core service in detail. What do you help clients achieve?</p>
            <textarea
              value={wizardData.serviceDescription}
              onChange={(e) => updateWizard('serviceDescription', e.target.value)}
              rows={6}
              className={`${inputClass} resize-none`}
              style={inputStyle}
              placeholder="e.g., I build custom websites for small businesses. I handle everything from design to development to launch, including SEO setup and content migration..."
            />
          </ResultCard>
        )}

        {step === 2 && (
          <ResultCard title="What do you do EVERY time?" icon="\u2705">
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>List the tasks you perform for every single client, regardless of the project. These are your core deliverables.</p>
            <ChecklistBuilder
              items={wizardData.coreTasks}
              setItems={(items) => updateWizard('coreTasks', items)}
              placeholder="e.g., Discovery call, wireframe design, homepage build..."
            />
          </ResultCard>
        )}

        {step === 3 && (
          <ResultCard title="What varies between clients?" icon="\uD83D\uDD00">
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>List the tasks or deliverables that change from client to client. These will differentiate your tiers.</p>
            <ChecklistBuilder
              items={wizardData.variableTasks}
              setItems={(items) => updateWizard('variableTasks', items)}
              placeholder="e.g., Blog setup, e-commerce integration, custom animations..."
            />
          </ResultCard>
        )}

        {step === 4 && (
          <ResultCard title="Current Pricing" icon="\uD83D\uDCB0">
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>What do you currently charge? This helps us price your packages appropriately.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Hourly Rate ($) *</label>
                <input
                  type="number"
                  value={wizardData.hourlyRate}
                  onChange={(e) => updateWizard('hourlyRate', e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="150"
                />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Average Project Cost ($)</label>
                <input
                  type="number"
                  value={wizardData.avgProjectCost}
                  onChange={(e) => updateWizard('avgProjectCost', e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="5000"
                />
              </div>
            </div>
          </ResultCard>
        )}

        {step === 5 && (
          <ResultCard title="Who is your ideal client?" icon="\uD83C\uDFAF">
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Describe the perfect client for your services. This helps tailor each package tier.</p>
            <textarea
              value={wizardData.idealClient}
              onChange={(e) => updateWizard('idealClient', e.target.value)}
              rows={5}
              className={`${inputClass} resize-none`}
              style={inputStyle}
              placeholder="e.g., Small business owners with 5-50 employees who have outgrown their DIY website and are ready to invest in a professional online presence..."
            />
          </ResultCard>
        )}

        {step === 6 && wizardData.packages && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>Your Generated Packages</h2>
              <button onClick={regenerate} className="px-4 py-2 text-sm rounded-xl transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>Regenerate</button>
            </div>
            <div className="space-y-4">
              {wizardData.packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} editable={false} />
              ))}
            </div>
          </div>
        )}

        {step === 7 && wizardData.packages && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>Customize & Finalize</h2>
              <div className="flex items-center gap-3">
                <CopyButton text={packagesText} label="Copy All" />
                <button onClick={exportPDF} className="px-4 py-2 text-sm rounded-xl font-medium transition-colors hover:opacity-80" style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}>Export PDF</button>
                <button onClick={resetWizard} className="px-4 py-2 text-sm rounded-xl transition-all hover:opacity-80" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>Start Over</button>
              </div>
            </div>

            <div ref={exportRef} className="space-y-4">
              <div className="rounded-xl p-6 mb-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <h3 className="font-bold text-xl mb-2 text-center" style={{ color: 'var(--text-heading)' }}>Service Packages</h3>
                <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>{wizardData.serviceDescription.slice(0, 150)}{wizardData.serviceDescription.length > 150 ? '...' : ''}</p>
              </div>
              {wizardData.packages.map((pkg, idx) => (
                <PackageCard key={pkg.id} pkg={pkg} editable={true} onUpdate={(updated) => updatePackage(idx, updated)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mt-8">
        <button
          onClick={goBack}
          disabled={step === 1}
          className="px-5 py-2.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all hover:opacity-80"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
        >
          &larr; Back
        </button>
        {step < 7 && (
          <button
            onClick={goNext}
            disabled={!canProceed}
            className="px-6 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-medium transition-colors hover:opacity-80"
            style={{ background: 'var(--accent)', color: 'var(--text-heading)' }}
          >
            {step === 5 ? 'Generate Packages' : 'Next'} &rarr;
          </button>
        )}
      </div>
    </ToolLayout>
  )
}
