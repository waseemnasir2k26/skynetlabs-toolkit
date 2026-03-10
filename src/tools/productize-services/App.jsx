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
          className="flex-1 bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#13b973]/50"
          placeholder={placeholder}
        />
        <button onClick={addItem} className="px-4 py-3 bg-[#13b973] hover:bg-[#13b973]/80 text-white rounded-xl font-medium transition-colors">Add</button>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-600 text-sm py-4 text-center">No items added yet. Type above and click Add or press Enter.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={item.id} className="flex items-center gap-3 bg-dark-200/30 border border-white/5 rounded-lg px-4 py-2.5 group">
              <span className="text-[#13b973] text-sm font-mono w-6">{idx + 1}.</span>
              <span className="text-gray-300 text-sm flex-1">{item.text}</span>
              <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">&times;</button>
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
  const inputClass = "w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#13b973]/50 text-sm"

  const tierColors = {
    starter: 'border-gray-500/30',
    professional: 'border-[#13b973]/30',
    premium: 'border-yellow-500/30',
  }

  const tierBadge = {
    starter: 'bg-gray-500/20 text-gray-400',
    professional: 'bg-[#13b973]/20 text-[#13b973]',
    premium: 'bg-yellow-500/20 text-yellow-400',
  }

  if (editable) {
    return (
      <div className={`bg-dark-100/50 border ${tierColors[pkg.id] || 'border-white/5'} rounded-xl p-5`}>
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={pkg.name}
            onChange={(e) => onUpdate({ ...pkg, name: e.target.value })}
            className="bg-transparent text-white font-bold text-xl focus:outline-none border-b border-transparent focus:border-[#13b973]/50"
          />
          <div className="flex items-center gap-1">
            <span className="text-gray-400 text-sm">$</span>
            <input
              type="number"
              value={pkg.price}
              onChange={(e) => onUpdate({ ...pkg, price: Number(e.target.value) })}
              className="w-24 bg-transparent text-[#13b973] font-bold text-2xl focus:outline-none text-right"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Timeline</label>
          <input type="text" value={pkg.timeline} onChange={(e) => onUpdate({ ...pkg, timeline: e.target.value })} className={inputClass} />
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Ideal For</label>
          <textarea value={pkg.idealFor} onChange={(e) => onUpdate({ ...pkg, idealFor: e.target.value })} rows={2} className={`${inputClass} resize-none`} />
        </div>

        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Deliverables (one per line)</label>
          <textarea
            value={pkg.deliverables.join('\n')}
            onChange={(e) => onUpdate({ ...pkg, deliverables: e.target.value.split('\n') })}
            rows={Math.max(3, pkg.deliverables.length)}
            className={`${inputClass} resize-none font-mono`}
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Exclusions (one per line)</label>
          <textarea
            value={pkg.exclusions.join('\n')}
            onChange={(e) => onUpdate({ ...pkg, exclusions: e.target.value.split('\n').filter(Boolean) })}
            rows={Math.max(2, pkg.exclusions.length || 1)}
            className={`${inputClass} resize-none font-mono`}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-dark-100/50 border ${tierColors[pkg.id] || 'border-white/5'} rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${tierBadge[pkg.id] || 'bg-gray-500/20 text-gray-400'}`}>{pkg.name}</span>
        </div>
        <p className="text-[#13b973] font-bold text-2xl">${pkg.price.toLocaleString()}</p>
      </div>
      <p className="text-gray-400 text-sm mb-1">Timeline: <span className="text-gray-300">{pkg.timeline}</span></p>
      <p className="text-gray-500 text-sm mb-4 italic">{pkg.idealFor}</p>

      <h4 className="text-white text-sm font-medium mb-2">Deliverables</h4>
      <ul className="space-y-1.5 mb-4">
        {pkg.deliverables.map((d, i) => (
          <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
            <span className="text-[#13b973] mt-0.5">\u2713</span> {d}
          </li>
        ))}
      </ul>

      {pkg.exclusions.length > 0 && (
        <>
          <h4 className="text-white text-sm font-medium mb-2">Not Included</h4>
          <ul className="space-y-1.5">
            {pkg.exclusions.map((e, i) => (
              <li key={i} className="text-gray-500 text-sm flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">\u2717</span> {e}
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
      const canvas = await html2canvas(el, { backgroundColor: '#0a0a0f', scale: 2 })
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

  const inputClass = "w-full bg-dark-200/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#13b973]/50"

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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s.num === step ? 'bg-[#13b973] text-white' : s.num < step ? 'bg-[#13b973]/20 text-[#13b973]' : 'bg-dark-200 text-gray-600'}`}>
                {s.num < step ? '\u2713' : s.num}
              </div>
              <span className={`text-xs ${s.num === step ? 'text-white' : s.num < step ? 'text-gray-400' : 'text-gray-600'}`}>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="h-1.5 bg-dark-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#13b973] rounded-full transition-all duration-300" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
        </div>
        <p className="sm:hidden text-gray-400 text-sm mt-2">Step {step} of {STEPS.length}: {STEPS[step - 1].label}</p>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto">
        {step === 1 && (
          <ResultCard title="What service do you offer?" icon="\uD83D\uDCA1">
            <p className="text-gray-500 text-sm mb-4">Describe your core service in detail. What do you help clients achieve?</p>
            <textarea
              value={wizardData.serviceDescription}
              onChange={(e) => updateWizard('serviceDescription', e.target.value)}
              rows={6}
              className={`${inputClass} resize-none`}
              placeholder="e.g., I build custom websites for small businesses. I handle everything from design to development to launch, including SEO setup and content migration..."
            />
          </ResultCard>
        )}

        {step === 2 && (
          <ResultCard title="What do you do EVERY time?" icon="\u2705">
            <p className="text-gray-500 text-sm mb-4">List the tasks you perform for every single client, regardless of the project. These are your core deliverables.</p>
            <ChecklistBuilder
              items={wizardData.coreTasks}
              setItems={(items) => updateWizard('coreTasks', items)}
              placeholder="e.g., Discovery call, wireframe design, homepage build..."
            />
          </ResultCard>
        )}

        {step === 3 && (
          <ResultCard title="What varies between clients?" icon="\uD83D\uDD00">
            <p className="text-gray-500 text-sm mb-4">List the tasks or deliverables that change from client to client. These will differentiate your tiers.</p>
            <ChecklistBuilder
              items={wizardData.variableTasks}
              setItems={(items) => updateWizard('variableTasks', items)}
              placeholder="e.g., Blog setup, e-commerce integration, custom animations..."
            />
          </ResultCard>
        )}

        {step === 4 && (
          <ResultCard title="Current Pricing" icon="\uD83D\uDCB0">
            <p className="text-gray-500 text-sm mb-4">What do you currently charge? This helps us price your packages appropriately.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Hourly Rate ($) *</label>
                <input
                  type="number"
                  value={wizardData.hourlyRate}
                  onChange={(e) => updateWizard('hourlyRate', e.target.value)}
                  className={inputClass}
                  placeholder="150"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Average Project Cost ($)</label>
                <input
                  type="number"
                  value={wizardData.avgProjectCost}
                  onChange={(e) => updateWizard('avgProjectCost', e.target.value)}
                  className={inputClass}
                  placeholder="5000"
                />
              </div>
            </div>
          </ResultCard>
        )}

        {step === 5 && (
          <ResultCard title="Who is your ideal client?" icon="\uD83C\uDFAF">
            <p className="text-gray-500 text-sm mb-4">Describe the perfect client for your services. This helps tailor each package tier.</p>
            <textarea
              value={wizardData.idealClient}
              onChange={(e) => updateWizard('idealClient', e.target.value)}
              rows={5}
              className={`${inputClass} resize-none`}
              placeholder="e.g., Small business owners with 5-50 employees who have outgrown their DIY website and are ready to invest in a professional online presence..."
            />
          </ResultCard>
        )}

        {step === 6 && wizardData.packages && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Your Generated Packages</h2>
              <button onClick={regenerate} className="px-4 py-2 text-sm bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200 rounded-xl transition-all">Regenerate</button>
            </div>
            <div className="space-y-4" ref={step === 6 ? undefined : undefined}>
              {wizardData.packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} editable={false} />
              ))}
            </div>
          </div>
        )}

        {step === 7 && wizardData.packages && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Customize & Finalize</h2>
              <div className="flex items-center gap-3">
                <CopyButton text={packagesText} label="Copy All" />
                <button onClick={exportPDF} className="px-4 py-2 text-sm bg-[#13b973] hover:bg-[#13b973]/80 text-white rounded-xl font-medium transition-colors">Export PDF</button>
                <button onClick={resetWizard} className="px-4 py-2 text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all">Start Over</button>
              </div>
            </div>

            <div ref={exportRef} className="space-y-4">
              <div className="bg-dark-100/30 border border-white/5 rounded-xl p-6 mb-4">
                <h3 className="text-white font-bold text-xl mb-2 text-center">Service Packages</h3>
                <p className="text-gray-400 text-sm text-center">{wizardData.serviceDescription.slice(0, 150)}{wizardData.serviceDescription.length > 150 ? '...' : ''}</p>
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
          className="px-5 py-2.5 text-sm bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all"
        >
          &larr; Back
        </button>
        {step < 7 && (
          <button
            onClick={goNext}
            disabled={!canProceed}
            className="px-6 py-2.5 text-sm bg-[#13b973] hover:bg-[#13b973]/80 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            {step === 5 ? 'Generate Packages' : 'Next'} &rarr;
          </button>
        )}
      </div>
    </ToolLayout>
  )
}
