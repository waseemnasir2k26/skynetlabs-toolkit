import { useState } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import CopyButton from '../shared/CopyButton'
import ExportButton from '../shared/ExportButton'

const SERVICE_TYPES = ['Web Development', 'Design', 'Marketing', 'Automation', 'Consulting', 'Other']
const REVISION_POLICIES = ['2 rounds', '3 rounds', 'Unlimited', 'Per-phase']

const DELIVERABLES_MAP = {
  'Web Development': [
    'Website architecture and wireframes',
    'Frontend development and responsive design',
    'Backend development and API integration',
    'Database design and implementation',
    'Testing, QA, and bug fixes',
    'Deployment and launch support',
  ],
  'Design': [
    'Brand discovery and mood board',
    'Logo concepts and variations',
    'Visual identity system and style guide',
    'Marketing collateral templates',
    'Digital asset creation',
    'Final file delivery in all formats',
  ],
  'Marketing': [
    'Market research and competitor analysis',
    'Marketing strategy development',
    'Content calendar and editorial plan',
    'Campaign creation and ad copy',
    'Analytics setup and tracking',
    'Performance reporting and optimization',
  ],
  'Automation': [
    'Process audit and workflow mapping',
    'Automation architecture design',
    'Integration development and API connections',
    'Workflow automation implementation',
    'Testing and validation',
    'Documentation and training',
  ],
  'Consulting': [
    'Discovery sessions and stakeholder interviews',
    'Current state analysis and assessment',
    'Strategic recommendations document',
    'Implementation roadmap',
    'Knowledge transfer sessions',
    'Follow-up review and adjustments',
  ],
  'Other': [
    'Requirements gathering and analysis',
    'Solution design and planning',
    'Implementation and development',
    'Quality assurance and review',
    'Delivery and handoff',
    'Post-delivery support',
  ],
}

function parseDescriptionKeywords(description) {
  const keywords = []
  const lower = description.toLowerCase()
  const keywordMap = {
    'website': 'Custom website build',
    'app': 'Application development',
    'mobile': 'Mobile-responsive implementation',
    'api': 'API development and integration',
    'database': 'Database architecture',
    'design': 'Visual design and UI/UX',
    'brand': 'Brand identity development',
    'logo': 'Logo design and variations',
    'seo': 'SEO optimization',
    'content': 'Content creation and strategy',
    'social': 'Social media setup',
    'email': 'Email marketing system',
    'automat': 'Process automation',
    'workflow': 'Workflow optimization',
    'integrat': 'System integrations',
    'dashboard': 'Dashboard and reporting',
    'ecommerce': 'E-commerce functionality',
    'e-commerce': 'E-commerce functionality',
    'analytics': 'Analytics and tracking',
    'crm': 'CRM setup and configuration',
    'training': 'Team training and documentation',
    'migration': 'Data migration',
    'security': 'Security implementation',
    'testing': 'Testing and QA',
    'hosting': 'Hosting and deployment',
    'maintenance': 'Ongoing maintenance plan',
  }
  for (const [key, value] of Object.entries(keywordMap)) {
    if (lower.includes(key)) keywords.push(value)
  }
  return keywords.length > 0 ? keywords : ['Project deliverable as specified']
}

function generateSOW(form) {
  const { projectName, clientName, serviceType, description, duration, budget, phases, revisionPolicy } = form
  const budgetNum = parseFloat(budget) || 0
  const phasesNum = parseInt(phases) || 1
  const durationNum = parseInt(duration) || 4
  const weeksPerPhase = Math.max(1, Math.round(durationNum / phasesNum))

  const baseDeliverables = DELIVERABLES_MAP[serviceType] || DELIVERABLES_MAP['Other']
  const descKeywords = parseDescriptionKeywords(description)

  // Build phase data
  const allDeliverables = [...new Set([...descKeywords, ...baseDeliverables])]
  const deliverablesPerPhase = Math.ceil(allDeliverables.length / phasesNum)

  const phaseNames = [
    'Discovery & Planning',
    'Design & Architecture',
    'Development & Implementation',
    'Testing & Refinement',
    'Launch & Deployment',
    'Post-Launch Support',
  ]

  const phaseData = []
  for (let i = 0; i < phasesNum; i++) {
    const start = i * deliverablesPerPhase
    const phaseDeliverables = allDeliverables.slice(start, start + deliverablesPerPhase)
    if (phaseDeliverables.length === 0) phaseDeliverables.push('Continued work on project deliverables')
    const phaseBudget = i === phasesNum - 1
      ? budgetNum - Math.floor(budgetNum / phasesNum) * (phasesNum - 1)
      : Math.floor(budgetNum / phasesNum)

    phaseData.push({
      name: phaseNames[i] || `Phase ${i + 1}`,
      number: i + 1,
      weekStart: i * weeksPerPhase + 1,
      weekEnd: Math.min((i + 1) * weeksPerPhase, durationNum),
      deliverables: phaseDeliverables,
      budget: phaseBudget,
    })
  }

  // Payment schedule
  const paymentSchedule = []
  if (phasesNum === 1) {
    paymentSchedule.push({ milestone: 'Project kickoff', amount: Math.round(budgetNum * 0.5), percent: 50 })
    paymentSchedule.push({ milestone: 'Project completion', amount: budgetNum - Math.round(budgetNum * 0.5), percent: 50 })
  } else {
    const upfront = Math.round(budgetNum * 0.3)
    paymentSchedule.push({ milestone: 'Project kickoff (deposit)', amount: upfront, percent: 30 })
    const remaining = budgetNum - upfront
    const perMilestone = Math.floor(remaining / (phasesNum - 1))
    for (let i = 1; i < phasesNum; i++) {
      const amt = i === phasesNum - 1 ? remaining - perMilestone * (phasesNum - 2) : perMilestone
      paymentSchedule.push({
        milestone: `${phaseData[i].name} completion`,
        amount: amt,
        percent: Math.round((amt / budgetNum) * 100),
      })
    }
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Revision policy text
  const revisionText = {
    '2 rounds': 'The Client is entitled to two (2) rounds of revisions per deliverable. Additional revisions beyond this allowance will be billed at the agreed hourly rate.',
    '3 rounds': 'The Client is entitled to three (3) rounds of revisions per deliverable. Additional revisions beyond this allowance will be billed at the agreed hourly rate.',
    'Unlimited': 'The Client is entitled to unlimited revisions within the project scope and timeline. Revisions that fall outside the defined scope will be treated as change requests.',
    'Per-phase': 'Each phase includes one (1) round of revisions before sign-off. The Client must approve each phase before work on the subsequent phase begins. Additional revisions will be billed separately.',
  }

  return {
    dateStr,
    projectName,
    clientName,
    serviceType,
    description,
    duration: durationNum,
    budget: budgetNum,
    phases: phaseData,
    paymentSchedule,
    revisionPolicyText: revisionText[revisionPolicy] || revisionText['2 rounds'],
    revisionPolicy,
    allDeliverables,
  }
}

function formatCurrency(num) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num)
}

function SOWDocument({ sow }) {
  return (
    <div id="sow-document" className="space-y-8" style={{ color: 'var(--text-body)' }}>
      {/* Header */}
      <div className="text-center pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-heading)' }}>Statement of Work</h2>
        <p className="font-semibold text-lg" style={{ color: 'var(--accent)' }}>{sow.projectName}</p>
        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Prepared for: {sow.clientName} | Date: {sow.dateStr}</p>
      </div>

      {/* 1. Project Overview */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span style={{ color: 'var(--accent)' }}>1.</span> Project Overview
        </h3>
        <p className="leading-relaxed">
          This Statement of Work outlines the scope, timeline, deliverables, and terms for the <strong style={{ color: 'var(--text-heading)' }}>{sow.projectName}</strong> project.
          The service provider will deliver <strong style={{ color: 'var(--text-heading)' }}>{sow.serviceType}</strong> services to <strong style={{ color: 'var(--text-heading)' }}>{sow.clientName}</strong> over
          a period of <strong style={{ color: 'var(--text-heading)' }}>{sow.duration} weeks</strong> for a total investment of <strong style={{ color: 'var(--text-heading)' }}>{formatCurrency(sow.budget)}</strong>.
        </p>
        <p className="mt-3 leading-relaxed">{sow.description}</p>
      </div>

      {/* 2. Scope of Work */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span style={{ color: 'var(--accent)' }}>2.</span> Scope of Work
        </h3>
        <p className="mb-4">The project is divided into {sow.phases.length} phase(s), each with specific deliverables and milestones:</p>
        {sow.phases.map((phase) => (
          <div key={phase.number} className="mb-4 rounded-lg p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <h4 className="font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>
              Phase {phase.number}: {phase.name}
              <span className="font-normal text-sm ml-2" style={{ color: 'var(--text-muted)' }}>(Weeks {phase.weekStart}-{phase.weekEnd})</span>
            </h4>
            <ul className="space-y-1">
              {phase.deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#10003;</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Phase Budget: {formatCurrency(phase.budget)}</p>
          </div>
        ))}
      </div>

      {/* 3. Out of Scope */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span style={{ color: 'var(--accent)' }}>3.</span> Out of Scope
        </h3>
        <p className="mb-2">The following items are explicitly excluded from this engagement unless agreed upon in a separate change order:</p>
        <ul className="space-y-1 text-sm">
          {[
            'Work not explicitly listed in the Scope of Work above',
            'Third-party licensing fees, stock assets, or subscription costs',
            'Content creation (copywriting, photography) unless specified',
            'Ongoing maintenance or support beyond the project timeline',
            'Changes to requirements after phase sign-off (subject to change order process)',
            'Training beyond what is specified in the deliverables',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5" style={{ color: 'var(--danger)' }}>&#10007;</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Timeline & Milestones */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span style={{ color: 'var(--accent)' }}>4.</span> Timeline & Milestones
        </h3>
        <p className="mb-3">Total project duration: <strong style={{ color: 'var(--text-heading)' }}>{sow.duration} weeks</strong></p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--text-muted)' }}>Milestone</th>
                <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--text-muted)' }}>Timeline</th>
                <th className="text-left py-2 font-medium" style={{ color: 'var(--text-muted)' }}>Key Deliverable</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-2 pr-4" style={{ color: 'var(--text-heading)' }}>Project Kickoff</td>
                <td className="py-2 pr-4">Week 1</td>
                <td className="py-2">Kickoff meeting & project plan</td>
              </tr>
              {sow.phases.map((phase) => (
                <tr key={phase.number} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-heading)' }}>{phase.name} Complete</td>
                  <td className="py-2 pr-4">Week {phase.weekEnd}</td>
                  <td className="py-2">{phase.deliverables[0]}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 pr-4" style={{ color: 'var(--text-heading)' }}>Final Delivery</td>
                <td className="py-2 pr-4">Week {sow.duration}</td>
                <td className="py-2">All deliverables complete & handoff</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Payment Schedule */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span style={{ color: 'var(--accent)' }}>5.</span> Payment Schedule
        </h3>
        <p className="mb-3">Total project investment: <strong style={{ color: 'var(--text-heading)' }}>{formatCurrency(sow.budget)}</strong></p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left py-2 pr-4 font-medium" style={{ color: 'var(--text-muted)' }}>Milestone</th>
                <th className="text-right py-2 pr-4 font-medium" style={{ color: 'var(--text-muted)' }}>Amount</th>
                <th className="text-right py-2 font-medium" style={{ color: 'var(--text-muted)' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {sow.paymentSchedule.map((p, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2 pr-4">{p.milestone}</td>
                  <td className="py-2 pr-4 text-right font-medium" style={{ color: 'var(--text-heading)' }}>{formatCurrency(p.amount)}</td>
                  <td className="py-2 text-right">{p.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
          Payment is due within 14 days of invoice date. Late payments may incur a 1.5% monthly fee.
        </p>
      </div>

      {/* 6. Revision Policy */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span style={{ color: 'var(--accent)' }}>6.</span> Revision Policy
        </h3>
        <p className="leading-relaxed">{sow.revisionPolicyText}</p>
      </div>

      {/* 7. Acceptance Criteria */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span style={{ color: 'var(--accent)' }}>7.</span> Acceptance Criteria
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#8226;</span>Each phase deliverable will be submitted for Client review upon completion.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#8226;</span>The Client has 5 business days to review and provide feedback on each deliverable.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#8226;</span>If no feedback is received within 5 business days, the deliverable is considered accepted.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#8226;</span>Written sign-off (email confirmation is acceptable) is required to proceed to the next phase.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#8226;</span>Final project acceptance will be confirmed in writing by the Client upon completion of all deliverables.</li>
        </ul>
      </div>

      {/* 8. Termination Clause */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span style={{ color: 'var(--accent)' }}>8.</span> Termination Clause
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#8226;</span>Either party may terminate this agreement with 14 days written notice.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#8226;</span>Upon termination, the Client will pay for all work completed up to the termination date.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#8226;</span>All completed deliverables and work-in-progress will be transferred to the Client upon final payment.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#8226;</span>Deposits and payments for completed phases are non-refundable.</li>
          <li className="flex items-start gap-2"><span className="mt-0.5" style={{ color: 'var(--accent)' }}>&#8226;</span>If the project is paused for more than 30 days without written agreement, the service provider reserves the right to re-scope the remaining work.</li>
        </ul>
      </div>

      {/* 9. Signatures */}
      <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span style={{ color: 'var(--accent)' }}>9.</span> Signatures
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Service Provider</p>
            <div className="mb-2" style={{ borderBottom: '1px solid var(--border)' }}></div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Name: _________________________</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Date: _________________________</p>
          </div>
          <div>
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Client ({sow.clientName})</p>
            <div className="mb-2" style={{ borderBottom: '1px solid var(--border)' }}></div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Name: _________________________</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Date: _________________________</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function sowToPlainText(sow) {
  let text = ''
  text += `STATEMENT OF WORK\n`
  text += `${'='.repeat(50)}\n\n`
  text += `Project: ${sow.projectName}\n`
  text += `Client: ${sow.clientName}\n`
  text += `Date: ${sow.dateStr}\n\n`

  text += `1. PROJECT OVERVIEW\n${'-'.repeat(30)}\n`
  text += `Service Type: ${sow.serviceType}\n`
  text += `Duration: ${sow.duration} weeks\n`
  text += `Total Budget: ${formatCurrency(sow.budget)}\n\n`
  text += `${sow.description}\n\n`

  text += `2. SCOPE OF WORK\n${'-'.repeat(30)}\n`
  sow.phases.forEach((phase) => {
    text += `\nPhase ${phase.number}: ${phase.name} (Weeks ${phase.weekStart}-${phase.weekEnd})\n`
    text += `Budget: ${formatCurrency(phase.budget)}\n`
    phase.deliverables.forEach((d) => { text += `  - ${d}\n` })
  })

  text += `\n3. OUT OF SCOPE\n${'-'.repeat(30)}\n`
  text += `  - Work not explicitly listed in the Scope of Work\n`
  text += `  - Third-party licensing fees, stock assets, or subscription costs\n`
  text += `  - Content creation unless specified\n`
  text += `  - Ongoing maintenance beyond the project timeline\n`
  text += `  - Changes after phase sign-off (subject to change order)\n`
  text += `  - Training beyond specified deliverables\n\n`

  text += `4. TIMELINE & MILESTONES\n${'-'.repeat(30)}\n`
  text += `Total Duration: ${sow.duration} weeks\n`
  text += `  Week 1: Project Kickoff\n`
  sow.phases.forEach((phase) => {
    text += `  Week ${phase.weekEnd}: ${phase.name} Complete\n`
  })
  text += `  Week ${sow.duration}: Final Delivery\n\n`

  text += `5. PAYMENT SCHEDULE\n${'-'.repeat(30)}\n`
  text += `Total Investment: ${formatCurrency(sow.budget)}\n`
  sow.paymentSchedule.forEach((p) => {
    text += `  ${p.milestone}: ${formatCurrency(p.amount)} (${p.percent}%)\n`
  })
  text += `\nPayment due within 14 days of invoice. Late payments: 1.5% monthly fee.\n\n`

  text += `6. REVISION POLICY\n${'-'.repeat(30)}\n`
  text += `${sow.revisionPolicyText}\n\n`

  text += `7. ACCEPTANCE CRITERIA\n${'-'.repeat(30)}\n`
  text += `  - Each deliverable submitted for Client review upon completion.\n`
  text += `  - 5 business days for review and feedback.\n`
  text += `  - No feedback within 5 days = accepted.\n`
  text += `  - Written sign-off required to proceed.\n`
  text += `  - Final acceptance confirmed in writing.\n\n`

  text += `8. TERMINATION CLAUSE\n${'-'.repeat(30)}\n`
  text += `  - 14 days written notice required.\n`
  text += `  - Payment for all completed work upon termination.\n`
  text += `  - Completed deliverables transferred upon final payment.\n`
  text += `  - Deposits and completed phase payments are non-refundable.\n`
  text += `  - 30+ day pause allows re-scoping.\n\n`

  text += `9. SIGNATURES\n${'-'.repeat(30)}\n\n`
  text += `Service Provider:\n`
  text += `Name: _________________________  Date: ___________\n\n`
  text += `Client (${sow.clientName}):\n`
  text += `Name: _________________________  Date: ___________\n`

  return text
}

const INITIAL_FORM = {
  projectName: '',
  clientName: '',
  serviceType: 'Web Development',
  description: '',
  duration: '4',
  budget: '',
  phases: '3',
  revisionPolicy: '2 rounds',
}

export default function App() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [sow, setSOW] = useState(null)

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const canGenerate = form.projectName.trim() && form.clientName.trim() && form.description.trim() && form.budget

  const handleGenerate = () => {
    if (!canGenerate) return
    const result = generateSOW(form)
    setSOW(result)
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setSOW(null)
  }

  const inputClass = 'w-full rounded-lg px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-1 transition text-sm'
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)', '--tw-ring-color': 'var(--accent-soft)' }
  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: 'var(--text-body)' }
  const selectClass = 'w-full rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 transition text-sm appearance-none'

  return (
    <ToolLayout
      title="AI SOW Generator"
      description="Generate professional Statement of Work documents for your projects. Fill in the details and get a complete, structured SOW ready for client review."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Panel */}
        <ResultCard title="Project Details" icon="📋">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Project Name *</label>
                <input
                  type="text"
                  className={inputClass}
                  style={inputStyle}
                  placeholder="e.g., Website Redesign"
                  value={form.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Client Name *</label>
                <input
                  type="text"
                  className={inputClass}
                  style={inputStyle}
                  placeholder="e.g., Acme Corp"
                  value={form.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Service Type</label>
                <select
                  className={selectClass}
                  style={inputStyle}
                  value={form.serviceType}
                  onChange={(e) => updateField('serviceType', e.target.value)}
                >
                  {SERVICE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Revision Policy</label>
                <select
                  className={selectClass}
                  style={inputStyle}
                  value={form.revisionPolicy}
                  onChange={(e) => updateField('revisionPolicy', e.target.value)}
                >
                  {REVISION_POLICIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} style={labelStyle}>Project Description *</label>
              <textarea
                className={`${inputClass} min-h-[100px] resize-y`}
                style={inputStyle}
                placeholder="Describe the project goals, key features, and expected outcomes..."
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Duration (weeks)</label>
                <input
                  type="number"
                  className={inputClass}
                  style={inputStyle}
                  min="1"
                  max="52"
                  value={form.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Total Budget ($) *</label>
                <input
                  type="number"
                  className={inputClass}
                  style={inputStyle}
                  placeholder="e.g., 15000"
                  min="0"
                  value={form.budget}
                  onChange={(e) => updateField('budget', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Number of Phases</label>
                <select
                  className={selectClass}
                  style={inputStyle}
                  value={form.phases}
                  onChange={(e) => updateField('phases', e.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'phase' : 'phases'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="flex-1 py-2.5 font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
              >
                Generate SOW
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-lg transition"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Reset
              </button>
            </div>
          </div>
        </ResultCard>

        {/* Preview Panel */}
        <div>
          {sow ? (
            <ResultCard title="Generated SOW" icon="📄">
              <div className="flex gap-2 mb-4">
                <CopyButton text={sowToPlainText(sow)} label="Copy SOW" />
                <ExportButton elementId="sow-document" filename={`SOW - ${sow.projectName}.pdf`} label="Export PDF" />
              </div>
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                <SOWDocument sow={sow} />
              </div>
            </ResultCard>
          ) : (
            <ResultCard title="SOW Preview" icon="📄">
              <div className="text-center py-16">
                <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>No SOW generated yet</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Fill in the project details and click "Generate SOW" to create your document.</p>
              </div>
            </ResultCard>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}
