import { useState, useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'
import CopyButton from '../shared/CopyButton'
import { useToast } from '../shared/Toast'
import { generateId } from '../shared/utils'

const STEPS = [
  { num: 1, title: 'Parties', icon: '\uD83D\uDC65' },
  { num: 2, title: 'Scope & Deliverables', icon: '\uD83D\uDCCB' },
  { num: 3, title: 'Payment & Timeline', icon: '\uD83D\uDCB0' },
  { num: 4, title: 'Legal Clauses', icon: '\u2696\uFE0F' },
]

const DEFAULT_CLAUSES = {
  ipTransfer: { label: 'IP Transfer', enabled: true, description: 'All intellectual property created during this engagement shall transfer to the Client upon full payment.' },
  confidentiality: { label: 'Confidentiality', enabled: true, description: 'Both parties agree to keep confidential any proprietary information shared during the engagement.' },
  nonCompete: { label: 'Non-Compete', enabled: false, description: 'The Service Provider agrees not to provide substantially similar services to direct competitors of the Client for a period of 6 months following contract termination.' },
  termination: { label: 'Termination', enabled: true, description: 'Either party may terminate this agreement with 14 days written notice. Upon termination, the Client shall pay for all work completed to date.' },
  latePayment: { label: 'Late Payment', enabled: true, description: 'Invoices not paid within 30 days of the due date will incur a late fee of 1.5% per month on the outstanding balance.' },
  forceMajeure: { label: 'Force Majeure', enabled: false, description: 'Neither party shall be liable for delays caused by circumstances beyond reasonable control, including natural disasters, pandemics, or government actions.' },
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Parties
  const [providerName, setProviderName] = useLocalStorage('skynet-contract-generator-providerName', '')
  const [providerCompany, setProviderCompany] = useLocalStorage('skynet-contract-generator-providerCompany', '')
  const [clientName, setClientName] = useLocalStorage('skynet-contract-generator-clientName', '')
  const [clientCompany, setClientCompany] = useLocalStorage('skynet-contract-generator-clientCompany', '')
  const [projectTitle, setProjectTitle] = useLocalStorage('skynet-contract-generator-projectTitle', '')

  // Step 2: Scope & Deliverables
  const [scopeDescription, setScopeDescription] = useLocalStorage('skynet-contract-generator-scopeDescription', '')
  const [deliverables, setDeliverables] = useLocalStorage('skynet-contract-generator-deliverables', [
    { id: generateId(), text: '' },
  ])
  const [revisionRounds, setRevisionRounds] = useLocalStorage('skynet-contract-generator-revisionRounds', 2)

  // Step 3: Payment & Timeline
  const [totalPrice, setTotalPrice] = useLocalStorage('skynet-contract-generator-totalPrice', 5000)
  const [upfrontPercent, setUpfrontPercent] = useLocalStorage('skynet-contract-generator-upfrontPercent', 50)
  const [milestonePercent, setMilestonePercent] = useLocalStorage('skynet-contract-generator-milestonePercent', 25)
  const [finalPercent, setFinalPercent] = useLocalStorage('skynet-contract-generator-finalPercent', 25)
  const [deadline, setDeadline] = useLocalStorage('skynet-contract-generator-deadline', '')

  // Step 4: Legal Clauses
  const [clauses, setClauses] = useLocalStorage('skynet-contract-generator-clauses', DEFAULT_CLAUSES)

  const toast = useToast()

  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(isFinite(n) ? n : 0)

  const addDeliverable = () => {
    setDeliverables([...deliverables, { id: generateId(), text: '' }])
  }

  const removeDeliverable = (id) => {
    if (deliverables.length <= 1) {
      if (toast) toast('At least one deliverable is required', 'error')
      return
    }
    setDeliverables(deliverables.filter(d => d.id !== id))
  }

  const updateDeliverable = (id, text) => {
    setDeliverables(deliverables.map(d => d.id === id ? { ...d, text } : d))
  }

  const toggleClause = (key) => {
    setClauses(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }))
  }

  const paymentTotal = (parseFloat(upfrontPercent) || 0) + (parseFloat(milestonePercent) || 0) + (parseFloat(finalPercent) || 0)
  const paymentValid = Math.abs(paymentTotal - 100) < 0.01

  const goNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }
  const goPrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const price = parseFloat(totalPrice) || 0

  const contractText = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const provider = providerName || '[SERVICE PROVIDER]'
    const provComp = providerCompany ? ` ("${providerCompany}")` : ''
    const client = clientName || '[CLIENT]'
    const cliComp = clientCompany ? ` ("${clientCompany}")` : ''
    const title = projectTitle || '[PROJECT TITLE]'
    const deadlineStr = deadline
      ? new Date(deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : '[DEADLINE]'

    let text = `FREELANCE SERVICE AGREEMENT
${'='.repeat(40)}

Date: ${today}
Project: ${title}

1. PARTIES
----------
Service Provider: ${provider}${provComp}
Client: ${client}${cliComp}

This agreement is entered into between the Service Provider and the Client for the project described below.

2. SCOPE OF WORK
-----------------
${scopeDescription || '[Describe the scope of work here]'}

3. DELIVERABLES
----------------
The Service Provider shall deliver the following:`

    const filteredDeliverables = deliverables.filter(d => d.text.trim())
    if (filteredDeliverables.length > 0) {
      filteredDeliverables.forEach((d, i) => {
        text += `\n   ${i + 1}. ${d.text}`
      })
    } else {
      text += '\n   [List deliverables here]'
    }

    text += `

4. REVISIONS
-------------
The Client is entitled to ${revisionRounds} round(s) of revisions per deliverable. Additional revisions will be billed at the Service Provider's standard hourly rate.

5. PAYMENT TERMS
-----------------
Total Project Fee: ${fmt(price)}

Payment Schedule:
   - Upfront Deposit (${upfrontPercent}%): ${fmt(price * (parseFloat(upfrontPercent) || 0) / 100)} - Due upon signing
   - Milestone Payment (${milestonePercent}%): ${fmt(price * (parseFloat(milestonePercent) || 0) / 100)} - Due at project midpoint
   - Final Payment (${finalPercent}%): ${fmt(price * (parseFloat(finalPercent) || 0) / 100)} - Due upon delivery

6. TIMELINE
------------
Project Deadline: ${deadlineStr}
Work shall commence upon receipt of the upfront deposit.

7. ADDITIONAL TERMS
--------------------`

    const enabledClauses = Object.entries(clauses).filter(([, v]) => v.enabled)
    if (enabledClauses.length > 0) {
      enabledClauses.forEach(([, clause], i) => {
        text += `\n${7}.${i + 1} ${clause.label.toUpperCase()}\n${clause.description}\n`
      })
    } else {
      text += '\n[No additional clauses selected]\n'
    }

    text += `
8. GOVERNING LAW
-----------------
This agreement shall be governed by the laws of the jurisdiction in which the Service Provider operates.

9. SIGNATURES
--------------

_______________________________          _______________________________
${provider}                              ${client}
Service Provider                         Client
Date: _______________                    Date: _______________`

    return text
  }, [providerName, providerCompany, clientName, clientCompany, projectTitle, scopeDescription, deliverables, revisionRounds, totalPrice, upfrontPercent, milestonePercent, finalPercent, deadline, clauses, price, fmt])

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-heading)',
    borderRadius: 'var(--radius)',
  }

  const labelStyle = { color: 'var(--text-muted)' }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Your Full Name</label>
          <input
            type="text"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Your Company Name</label>
          <input
            type="text"
            value={providerCompany}
            onChange={(e) => setProviderCompany(e.target.value)}
            placeholder="Smith Design Studio"
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Client Full Name</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={labelStyle}>Client Company Name</label>
          <input
            type="text"
            value={clientCompany}
            onChange={(e) => setClientCompany(e.target.value)}
            placeholder="Doe Enterprises LLC"
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={labelStyle}>Project Title</label>
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="Website Redesign & Development"
          className="w-full px-3 py-2 text-sm rounded-lg"
          style={inputStyle}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={labelStyle}>Scope of Work</label>
        <textarea
          value={scopeDescription}
          onChange={(e) => setScopeDescription(e.target.value)}
          rows={5}
          placeholder="Describe the project scope in detail. What are you building? What are the key objectives? What is included and what is not included?"
          className="w-full px-3 py-2 text-sm rounded-lg resize-y"
          style={inputStyle}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>Deliverables</label>
        <div className="space-y-2">
          {deliverables.map((d, idx) => (
            <div key={d.id} className="flex gap-2 items-center">
              <span className="text-xs font-medium w-6 text-center flex-shrink-0" style={{ color: 'var(--accent)' }}>{idx + 1}.</span>
              <input
                type="text"
                value={d.text}
                onChange={(e) => updateDeliverable(d.id, e.target.value)}
                placeholder={`Deliverable ${idx + 1}...`}
                className="flex-1 px-3 py-2 text-sm rounded-lg"
                style={inputStyle}
              />
              <button
                onClick={() => removeDeliverable(d.id)}
                className="p-1.5 rounded-lg transition-all flex-shrink-0"
                style={{ color: 'var(--danger)', background: 'var(--danger-soft)' }}
                title="Remove"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={addDeliverable}
            className="w-full py-2 text-sm font-medium rounded-lg transition-all border-2 border-dashed"
            style={{ color: 'var(--accent)', borderColor: 'var(--accent)', background: 'var(--accent-soft)' }}
          >
            + Add Deliverable
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={labelStyle}>Revision Rounds</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRevisionRounds(Math.max(0, revisionRounds - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
          >
            -
          </button>
          <span className="text-lg font-bold w-10 text-center" style={{ color: 'var(--accent)' }}>{revisionRounds}</span>
          <button
            onClick={() => setRevisionRounds(revisionRounds + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
          >
            +
          </button>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>rounds per deliverable</span>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={labelStyle}>Total Project Price</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
            className="w-full pl-7 pr-3 py-2 text-sm rounded-lg"
            style={inputStyle}
            min="0"
            step="500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={labelStyle}>
          Payment Schedule{' '}
          <span style={{ color: paymentValid ? 'var(--success)' : 'var(--danger)' }}>
            (Total: {paymentTotal}%{paymentValid ? ' \u2713' : ' - must equal 100%'})
          </span>
        </label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Upfront', value: upfrontPercent, setter: setUpfrontPercent, amount: price * (parseFloat(upfrontPercent) || 0) / 100 },
            { label: 'Milestone', value: milestonePercent, setter: setMilestonePercent, amount: price * (parseFloat(milestonePercent) || 0) / 100 },
            { label: 'Final', value: finalPercent, setter: setFinalPercent, amount: price * (parseFloat(finalPercent) || 0) / 100 },
          ].map((p) => (
            <div key={p.label} className="text-center">
              <label className="block text-xs mb-1" style={labelStyle}>{p.label}</label>
              <div className="relative">
                <input
                  type="number"
                  value={p.value}
                  onChange={(e) => p.setter(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg text-center"
                  style={inputStyle}
                  min="0"
                  max="100"
                  step="5"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>%</span>
              </div>
              <p className="text-xs mt-1 font-medium" style={{ color: 'var(--accent)' }}>{fmt(p.amount)}</p>
            </div>
          ))}
        </div>
        {/* Visual payment bar */}
        <div className="flex h-3 rounded-full overflow-hidden mt-3" style={{ background: 'var(--bg-card)' }}>
          <div style={{ width: `${upfrontPercent}%`, background: 'var(--accent)', transition: 'width 0.3s' }} />
          <div style={{ width: `${milestonePercent}%`, background: 'var(--info)', transition: 'width 0.3s' }} />
          <div style={{ width: `${finalPercent}%`, background: 'var(--success)', transition: 'width 0.3s' }} />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span style={{ color: 'var(--accent)' }}>Upfront</span>
          <span style={{ color: 'var(--info)' }}>Milestone</span>
          <span style={{ color: 'var(--success)' }}>Final</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={labelStyle}>Project Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg"
          style={inputStyle}
        />
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-4">
      <p className="text-sm" style={labelStyle}>
        Toggle the legal clauses you want to include in your contract. Each clause uses standard freelance-friendly language.
      </p>
      <div className="space-y-3">
        {Object.entries(clauses).map(([key, clause]) => (
          <div
            key={key}
            className="rounded-lg p-4 transition-all cursor-pointer"
            style={{
              background: clause.enabled ? 'var(--accent-soft)' : 'var(--bg-elevated)',
              border: `1px solid ${clause.enabled ? 'var(--accent)' : 'var(--border)'}`,
            }}
            onClick={() => toggleClause(key)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    background: clause.enabled ? 'var(--accent)' : 'transparent',
                    border: `2px solid ${clause.enabled ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {clause.enabled && (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>{clause.label}</span>
              </div>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: clause.enabled ? 'var(--success-soft)' : 'var(--bg-card)',
                  color: clause.enabled ? 'var(--success)' : 'var(--text-muted)',
                }}
              >
                {clause.enabled ? 'Included' : 'Excluded'}
              </span>
            </div>
            <p className="text-xs ml-8" style={{ color: 'var(--text-muted)' }}>{clause.description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <ToolLayout
      title="Contract Generator"
      description="Build professional freelance contracts step by step with customizable clauses, payment schedules, and deliverables."
      icon="\uD83D\uDCDD"
      category="Generator"
      maxWidth="wide"
      proTip="Always include IP transfer and late payment clauses. A clear contract prevents scope creep and protects both parties. This is a template - have it reviewed by a legal professional."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Wizard */}
        <div className="space-y-6">
          {/* Step Navigation */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex items-center flex-1">
                <button
                  onClick={() => setCurrentStep(step.num)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full"
                  style={{
                    background: currentStep === step.num ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: currentStep === step.num ? 'var(--text-on-accent)' : currentStep > step.num ? 'var(--accent)' : 'var(--text-muted)',
                    border: `1px solid ${currentStep === step.num ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  <span className="text-sm">{step.icon}</span>
                  <span className="text-xs font-medium hidden sm:inline">{step.title}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className="w-4 h-px mx-1 flex-shrink-0" style={{ background: 'var(--border)' }} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <ResultCard title={`Step ${currentStep}: ${STEPS[currentStep - 1].title}`} icon={STEPS[currentStep - 1].icon}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </ResultCard>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={goPrev}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{
                background: currentStep === 1 ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
                color: currentStep === 1 ? 'var(--text-muted)' : 'var(--text-heading)',
                border: '1px solid var(--border)',
                opacity: currentStep === 1 ? 0.5 : 1,
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={goNext}
              disabled={currentStep === 4}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{
                background: currentStep === 4 ? 'var(--bg-elevated)' : 'var(--accent)',
                color: currentStep === 4 ? 'var(--text-muted)' : 'var(--text-on-accent)',
                border: currentStep === 4 ? '1px solid var(--border)' : 'none',
                opacity: currentStep === 4 ? 0.5 : 1,
                cursor: currentStep === 4 ? 'not-allowed' : 'pointer',
              }}
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Completion Checklist */}
          <ResultCard title="Completion Checklist" icon="\u2705">
            <div className="space-y-2">
              {[
                { step: 1, label: 'Parties identified', done: providerName && clientName && projectTitle },
                { step: 2, label: 'Scope defined', done: scopeDescription && deliverables.some(d => d.text.trim()) },
                { step: 3, label: 'Payment terms set', done: totalPrice > 0 && paymentValid && deadline },
                { step: 4, label: 'Legal clauses selected', done: Object.values(clauses).some(c => c.enabled) },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setCurrentStep(item.step)}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: item.done ? 'var(--success)' : 'var(--bg-elevated)',
                      border: `2px solid ${item.done ? 'var(--success)' : 'var(--border)'}`,
                    }}
                  >
                    {item.done && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: item.done ? 'var(--text-heading)' : 'var(--text-muted)' }}>
                    Step {item.step}: {item.label}
                  </span>
                </div>
              ))}
            </div>
          </ResultCard>
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>Contract Preview</h3>
            <div className="flex gap-2">
              <CopyButton text={contractText} label="Copy" />
              <ExportButton elementId="contract-preview" filename={`${projectTitle || 'contract'}.pdf`} label="Export PDF" />
            </div>
          </div>

          <div
            id="contract-preview"
            className="rounded-xl p-6 sm:p-8"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <pre
              className="text-xs sm:text-sm whitespace-pre-wrap font-mono leading-relaxed"
              style={{ color: 'var(--text-body)' }}
            >
              {contractText}
            </pre>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
