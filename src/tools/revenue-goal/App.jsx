import { useState, useMemo, useRef } from 'react'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtDec = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

export default function App() {
  const [annualGoal, setAnnualGoal] = useState(150000)
  const [avgProjectValue, setAvgProjectValue] = useState(5000)
  const [avgHourlyRate, setAvgHourlyRate] = useState(100)
  const [closeRate, setCloseRate] = useState(25)
  const [avgClientLifetime, setAvgClientLifetime] = useState(6)
  const [workingDays, setWorkingDays] = useState(5)
  const [weeksVacation, setWeeksVacation] = useState(2)
  const exportRef = useRef(null)

  const metrics = useMemo(() => {
    const workingWeeks = 52 - weeksVacation
    const totalWorkingDays = workingWeeks * workingDays

    const monthlyTarget = annualGoal / 12
    const weeklyTarget = annualGoal / workingWeeks
    const dailyTarget = annualGoal / totalWorkingDays

    const projectsNeeded = Math.ceil(annualGoal / avgProjectValue)
    const activeClientsNeeded = Math.ceil(projectsNeeded / (12 / avgClientLifetime))
    const proposalsPerMonth = Math.ceil((projectsNeeded / 12) / (closeRate / 100))
    const leadsPerMonth = Math.ceil(proposalsPerMonth * 2.5)
    const dailyOutreach = Math.ceil(leadsPerMonth / (workingDays * (workingWeeks / 12)))

    const billableHoursPerDay = avgProjectValue / avgHourlyRate / (totalWorkingDays / projectsNeeded)

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
    try {
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, logging: false, backgroundColor: '#0a0a0f',
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
    } finally {
      el.style.overflow = origOverflow
      el.style.height = origHeight
      el.style.maxHeight = origMaxHeight
    }
  }

  const SliderInput = ({ label, value, onChange, min, max, step = 1, prefix = '', suffix = '' }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-gray-400">{label}</label>
        <span className="text-sm font-semibold text-white">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#13b973] bg-white/10"
      />
      <div className="flex justify-between text-xs text-gray-600">
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
                    <div className="text-xs text-gray-400">{step.label}</div>
                    <div className="text-lg font-bold text-white">{step.value}</div>
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
            <div key={m.label} className="bg-dark-100/50 border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#13b973]">{m.value}</div>
              <div className="text-xs text-gray-400 mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Action Plan */}
        <ResultCard title="Your Action Plan" icon="📋" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actionPlan.map((section) => (
              <div key={section.title}>
                <h4 className="text-white font-semibold mb-3 text-sm border-b border-white/10 pb-2">{section.title}</h4>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-300">
                      <span className="text-[#13b973] mt-0.5 shrink-0">&#10003;</span>
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
      <div className="flex justify-center">
        <button
          onClick={handleExportPDF}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#13b973] hover:bg-[#0fa863] text-white font-medium rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Goal Summary PDF
        </button>
      </div>
    </ToolLayout>
  )
}
