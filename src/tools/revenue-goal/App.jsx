import { useState, useMemo, useRef } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import { useToast } from '../shared/Toast'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(isFinite(n) ? n : 0)
const fmtDec = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(isFinite(n) ? n : 0)

export default function App() {
  const [annualGoal, setAnnualGoal] = useState(150000)
  const [avgProjectValue, setAvgProjectValue] = useState(5000)
  const [avgHourlyRate, setAvgHourlyRate] = useState(100)
  const [closeRate, setCloseRate] = useState(25)
  const [avgClientLifetime, setAvgClientLifetime] = useState(6)
  const [workingDays, setWorkingDays] = useState(5)
  const [weeksVacation, setWeeksVacation] = useState(2)
  const exportRef = useRef(null)
  const toast = useToast()

  const { generateShareURL } = useShareableURL(
    { annualGoal, avgProjectValue, avgHourlyRate, closeRate, avgClientLifetime, workingDays, weeksVacation },
    {
      annualGoal: setAnnualGoal,
      avgProjectValue: setAvgProjectValue,
      avgHourlyRate: setAvgHourlyRate,
      closeRate: setCloseRate,
      avgClientLifetime: setAvgClientLifetime,
      workingDays: setWorkingDays,
      weeksVacation: setWeeksVacation,
    }
  )

  const metrics = useMemo(() => {
    const safeGoal = Math.max(0, parseFloat(annualGoal) || 0)
    const safeProjectValue = Math.max(1, parseFloat(avgProjectValue) || 1)
    const safeHourlyRate = Math.max(1, parseFloat(avgHourlyRate) || 1)
    const safeCloseRate = Math.max(1, Math.min(100, parseFloat(closeRate) || 1))
    const safeClientLifetime = Math.max(1, parseFloat(avgClientLifetime) || 1)
    const safeWorkingDays = Math.max(1, parseFloat(workingDays) || 1)
    const safeWeeksVacation = Math.max(0, Math.min(51, parseFloat(weeksVacation) || 0))

    const workingWeeks = Math.max(1, 52 - safeWeeksVacation)
    const totalWorkingDays = workingWeeks * safeWorkingDays

    const monthlyTarget = safeGoal / 12
    const weeklyTarget = safeGoal / workingWeeks
    const dailyTarget = totalWorkingDays > 0 ? safeGoal / totalWorkingDays : 0

    const projectsNeeded = Math.ceil(safeGoal / safeProjectValue)
    const avgClientLifetimeRatio = 12 / safeClientLifetime
    const activeClientsNeeded = avgClientLifetimeRatio > 0 ? Math.ceil(projectsNeeded / avgClientLifetimeRatio) : 0
    const proposalsPerMonth = safeCloseRate > 0 ? Math.ceil((projectsNeeded / 12) / (safeCloseRate / 100)) : 0
    const leadsPerMonth = Math.ceil(proposalsPerMonth * 2.5)
    const dailyOutreachDivisor = safeWorkingDays * (workingWeeks / 12)
    const dailyOutreach = dailyOutreachDivisor > 0 ? Math.ceil(leadsPerMonth / dailyOutreachDivisor) : 0

    const daysPerProject = projectsNeeded > 0 ? totalWorkingDays / projectsNeeded : 1
    const billableHoursPerDay = daysPerProject > 0 ? safeProjectValue / safeHourlyRate / daysPerProject : 0

    return {
      monthlyTarget,
      weeklyTarget,
      dailyTarget,
      projectsNeeded,
      activeClientsNeeded,
      proposalsPerMonth,
      leadsPerMonth,
      dailyOutreach,
      totalWorkingDays,
      workingWeeks,
      billableHoursPerDay: Math.min(billableHoursPerDay, 8),
    }
  }, [annualGoal, avgProjectValue, avgHourlyRate, closeRate, avgClientLifetime, workingDays, weeksVacation])

  const funnelSteps = [
    { label: 'Annual Goal', value: fmt(annualGoal), width: 100 },
    { label: 'Monthly Target', value: fmt(metrics.monthlyTarget), width: 92 },
    { label: 'Weekly Target', value: fmt(metrics.weeklyTarget), width: 84 },
    { label: 'Daily Target', value: fmtDec(metrics.dailyTarget), width: 76 },
    { label: 'Projects / Year', value: metrics.projectsNeeded, width: 68 },
    { label: 'Active Clients Needed', value: metrics.activeClientsNeeded, width: 60 },
    { label: 'Proposals / Month', value: metrics.proposalsPerMonth, width: 52 },
    { label: 'Leads / Month', value: metrics.leadsPerMonth, width: 44 },
    { label: 'Daily Outreach Actions', value: metrics.dailyOutreach, width: 36 },
  ]

  const actionPlan = useMemo(() => {
    const actions = []
    actions.push({
      title: 'Daily Actions',
      items: [
        `Send ${metrics.dailyOutreach} outreach messages (cold email, LinkedIn, DMs)`,
        `Bill ${metrics.billableHoursPerDay.toFixed(1)} hours of client work`,
        `Spend 30 minutes on content creation to attract inbound leads`,
        `Follow up with 2-3 warm prospects from your pipeline`,
      ],
    })
    actions.push({
      title: 'Weekly Actions',
      items: [
        `Send ${metrics.proposalsPerMonth > 4 ? Math.ceil(metrics.proposalsPerMonth / 4) : 1} proposals to qualified leads`,
        `Conduct ${Math.max(1, Math.ceil(metrics.proposalsPerMonth / 4))} discovery calls`,
        `Revenue target: ${fmt(metrics.weeklyTarget)} per week`,
        `Review pipeline and update CRM / tracking`,
        `Create 1-2 pieces of portfolio or case study content`,
      ],
    })
    actions.push({
      title: 'Monthly Actions',
      items: [
        `Close ${Math.ceil(metrics.projectsNeeded / 12)} new projects (at ${closeRate}% close rate)`,
        `Generate ${metrics.leadsPerMonth} qualified leads through outreach + inbound`,
        `Send ${metrics.proposalsPerMonth} proposals`,
        `Review monthly revenue against ${fmt(metrics.monthlyTarget)} target`,
        `Nurture ${metrics.activeClientsNeeded} active client relationships`,
        `Identify upsell / cross-sell opportunities with existing clients`,
      ],
    })
    return actions
  }, [metrics, closeRate])

  const handleExportPDF = async () => {
    const el = exportRef.current
    if (!el) return
    const origOverflow = el.style.overflow
    const origHeight = el.style.height
    const origMaxHeight = el.style.maxHeight
    el.style.overflow = 'visible'
    el.style.height = 'auto'
    el.style.maxHeight = 'none'
    const root = document.documentElement
    const originalTheme = root.getAttribute('data-theme')
    root.setAttribute('data-theme', 'light')
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
    try {
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff',
        windowWidth: el.scrollWidth, windowHeight: el.scrollHeight,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const ratio = pdfWidth / canvas.width
      const totalH = canvas.height * ratio
      let pos = 0
      while (pos < totalH) {
        if (pos > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -pos, pdfWidth, totalH)
        pos += pdfHeight
      }
      pdf.save('revenue-goal-plan.pdf')
      if (toast) toast('Revenue plan exported as PDF!', 'success')
    } finally {
      root.setAttribute('data-theme', originalTheme || 'dark')
      el.style.overflow = origOverflow
      el.style.height = origHeight
      el.style.maxHeight = origMaxHeight
    }
  }

  const SliderInput = ({ label, value, onChange, min, max, step = 1, prefix = '', suffix = '' }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</label>
        <span className="text-sm font-semibold" style={{ color: "var(--text-heading)" }}>{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: "var(--accent)", background: "rgba(255,255,255,0.1)" }}
      />
      <div className="flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
        <span>{prefix}{min.toLocaleString()}{suffix}</span>
        <span>{prefix}{max.toLocaleString()}{suffix}</span>
      </div>
    </div>
  )

  return (
    <ToolLayout
      title="Annual Revenue Goal Reverse-Engineer"
      description="Break down your annual income goal into daily actionable targets with a visual funnel and personalized action plan."
    >
      <div ref={exportRef} id="revenue-goal-export">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Inputs / Sliders */}
          <ResultCard title="What-If Sliders" icon="🎯">
            <div className="space-y-5">
              <SliderInput label="Annual Income Goal" value={annualGoal} onChange={setAnnualGoal} min={25000} max={1000000} step={5000} prefix="$" />
              <SliderInput label="Average Project Value" value={avgProjectValue} onChange={setAvgProjectValue} min={500} max={50000} step={500} prefix="$" />
              <SliderInput label="Average Hourly Rate" value={avgHourlyRate} onChange={setAvgHourlyRate} min={25} max={500} step={5} prefix="$" />
              <SliderInput label="Close Rate" value={closeRate} onChange={setCloseRate} min={5} max={80} suffix="%" />
              <SliderInput label="Average Client Lifetime" value={avgClientLifetime} onChange={setAvgClientLifetime} min={1} max={24} suffix=" months" />
              <SliderInput label="Working Days / Week" value={workingDays} onChange={setWorkingDays} min={3} max={7} />
              <SliderInput label="Weeks Vacation / Year" value={weeksVacation} onChange={setWeeksVacation} min={0} max={12} />
            </div>
          </ResultCard>

          {/* Funnel Visualization */}
          <ResultCard title="Revenue Funnel" icon="🔻">
            <div className="flex flex-col items-center gap-2">
              {funnelSteps.map((step, i) => (
                <div
                  key={step.label}
                  className="relative flex items-center justify-center py-3 rounded-lg transition-all duration-500"
                  style={{
                    width: `${step.width}%`,
                    background: `linear-gradient(135deg, rgba(19,185,115,${0.15 + i * 0.05}) 0%, rgba(19,185,115,${0.05 + i * 0.03}) 100%)`,
                    border: '1px solid rgba(19,185,115,0.2)',
                  }}
                >
                  <div className="text-center">
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{step.label}</div>
                    <div className="text-lg font-bold" style={{ color: "var(--text-heading)" }}>{step.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Working Days/Year', value: metrics.totalWorkingDays },
            { label: 'Working Weeks', value: metrics.workingWeeks },
            { label: 'Billable Hrs/Day', value: metrics.billableHoursPerDay.toFixed(1) },
            { label: 'Projects/Month', value: (metrics.projectsNeeded / 12).toFixed(1) },
          ].map((m) => (
            <div key={m.label} className="rounded-xl p-4 text-center" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
              <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{m.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Action Plan */}
        <ResultCard title="Your Action Plan" icon="📋" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actionPlan.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-3 text-sm pb-2" style={{ color: "var(--text-heading)", borderBottom: "1px solid var(--border)" }}>{section.title}</h4>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-body)" }}>
                      <span className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }}>&#10003;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ResultCard>
      </div>

      {/* Export */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all"
          style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Goal Summary PDF
        </button>
        <ShareButton getShareURL={generateShareURL} />
      </div>
    </ToolLayout>
  )
}
