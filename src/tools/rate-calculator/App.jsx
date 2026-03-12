import { useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'

const fmt = (n) => {
  const safe = isFinite(n) ? n : 0
  if (Math.abs(safe) >= 1000000) return `$${(safe / 1000000).toFixed(1)}M`
  if (Math.abs(safe) >= 1000) return `$${(safe / 1000).toFixed(1)}K`
  return `$${safe.toFixed(2)}`
}

const fmtWhole = (n) => {
  const safe = isFinite(n) ? n : 0
  return `$${safe.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function NumberInput({ label, value, onChange, prefix = '', suffix = '', min = 0, step = 1, helpText = '' }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-body)' }}>{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={e => onChange(Math.max(min, parseFloat(e.target.value) || 0))}
          min={min}
          step={step}
          className={`w-full rounded-lg py-2.5 text-sm focus:outline-none ${prefix ? 'pl-7 pr-4' : suffix ? 'pl-4 pr-12' : 'px-4'}`}
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>{suffix}</span>
        )}
      </div>
      {helpText && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{helpText}</p>}
    </div>
  )
}

function Slider({ label, value, onChange, min, max, suffix = '%' }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>{label}</label>
        <span className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        min={min}
        max={max}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: 'var(--accent)', background: 'var(--bg-card)' }}
      />
    </div>
  )
}

function MetricBox({ label, value, sub, highlight = false, large = false }) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={highlight
        ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)' }
        : { background: 'var(--bg-elevated)', borderColor: 'var(--border)' }
      }
    >
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className={`${large ? 'text-3xl' : 'text-xl'} font-bold`} style={{ color: highlight ? 'var(--accent)' : 'var(--text-heading)' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

function CostBar({ label, amount, total, color }) {
  const percentage = total > 0 ? (amount / total) * 100 : 0
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: 'var(--text-body)' }}>{label}</span>
        <span className="font-medium" style={{ color: 'var(--text-heading)' }}>{fmtWhole(amount)} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function App() {
  const [salary, setSalary] = useLocalStorage('skynet-rate-calculator-salary', 80000)
  const [rent, setRent] = useLocalStorage('skynet-rate-calculator-rent', 12000)
  const [software, setSoftware] = useLocalStorage('skynet-rate-calculator-software', 3000)
  const [insurance, setInsurance] = useLocalStorage('skynet-rate-calculator-insurance', 5000)
  const [otherExpenses, setOtherExpenses] = useLocalStorage('skynet-rate-calculator-other', 2000)
  const [vacationWeeks, setVacationWeeks] = useLocalStorage('skynet-rate-calculator-vacation', 3)
  const [billableHours, setBillableHours] = useLocalStorage('skynet-rate-calculator-hours', 6)
  const [workingDays, setWorkingDays] = useLocalStorage('skynet-rate-calculator-days', 5)
  const [profitMargin, setProfitMargin] = useLocalStorage('skynet-rate-calculator-margin', 20)

  const { generateShareURL } = useShareableURL(
    { salary, rent, software, insurance, otherExpenses, vacationWeeks, billableHours, workingDays, profitMargin },
    {
      salary: setSalary,
      rent: setRent,
      software: setSoftware,
      insurance: setInsurance,
      otherExpenses: setOtherExpenses,
      vacationWeeks: setVacationWeeks,
      billableHours: setBillableHours,
      workingDays: setWorkingDays,
      profitMargin: setProfitMargin,
    }
  )

  const calc = useMemo(() => {
    const totalExpenses = rent + software + insurance + otherExpenses
    const totalAnnualCost = salary + totalExpenses
    const workingWeeks = 52 - vacationWeeks
    const totalBillableHours = workingWeeks * workingDays * billableHours
    const baseCostPerHour = totalBillableHours > 0 ? totalAnnualCost / totalBillableHours : 0
    const marginMultiplier = 1 + (profitMargin / 100)
    const hourlyRate = baseCostPerHour * marginMultiplier
    const dayRate = hourlyRate * billableHours
    const weeklyRate = dayRate * workingDays
    const monthlyRetainer = (totalAnnualCost * marginMultiplier) / 12
    const annualRevenue = totalAnnualCost * marginMultiplier
    const annualProfit = annualRevenue - totalAnnualCost

    return {
      totalExpenses,
      totalAnnualCost,
      workingWeeks,
      totalBillableHours,
      baseCostPerHour,
      hourlyRate,
      dayRate,
      weeklyRate,
      monthlyRetainer,
      annualRevenue,
      annualProfit,
    }
  }, [salary, rent, software, insurance, otherExpenses, vacationWeeks, billableHours, workingDays, profitMargin])

  const costBreakdown = [
    { label: 'Desired Salary', amount: salary, color: 'var(--accent)' },
    { label: 'Rent / Office', amount: rent, color: 'var(--info)' },
    { label: 'Software & Tools', amount: software, color: 'var(--warning)' },
    { label: 'Insurance', amount: insurance, color: 'var(--danger)' },
    { label: 'Other Expenses', amount: otherExpenses, color: '#a78bfa' },
  ]

  return (
    <ToolLayout
      title="Freelance Rate Calculator"
      description="Calculate your ideal hourly, day, and retainer rates based on your real costs so you never undercharge again."
      category="Revenue & Growth"
      icon="💰"
      proTip="Most freelancers undercharge by 30-50%. Your rate needs to cover not just your salary, but all business expenses, taxes, and profit. If clients consistently say yes without hesitation, you're too cheap."
    >
      <div id="rate-calculator-results">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Inputs */}
          <div className="space-y-6">
            <ResultCard title="Your Income Goal" icon="🎯">
              <div className="space-y-4">
                <NumberInput
                  label="Desired Annual Salary (take-home)"
                  value={salary}
                  onChange={setSalary}
                  prefix="$"
                  step={5000}
                  helpText="What you want to pay yourself before personal taxes"
                />
              </div>
            </ResultCard>

            <ResultCard title="Annual Business Expenses" icon="🧾">
              <div className="space-y-4">
                <NumberInput label="Rent / Office / Coworking" value={rent} onChange={setRent} prefix="$" step={500} />
                <NumberInput label="Software & Tools" value={software} onChange={setSoftware} prefix="$" step={100} helpText="Figma, Adobe, hosting, etc." />
                <NumberInput label="Insurance (health, liability, etc.)" value={insurance} onChange={setInsurance} prefix="$" step={500} />
                <NumberInput label="Other Expenses" value={otherExpenses} onChange={setOtherExpenses} prefix="$" step={500} helpText="Education, travel, equipment, accountant, etc." />
              </div>
            </ResultCard>

            <ResultCard title="Availability" icon="📅">
              <div className="space-y-4">
                <NumberInput label="Weeks of Vacation / Time Off" value={vacationWeeks} onChange={setVacationWeeks} suffix="weeks" min={0} step={1} />
                <NumberInput label="Billable Hours Per Day" value={billableHours} onChange={setBillableHours} suffix="hrs" min={1} step={0.5} helpText="Realistic: 5-6 hrs (rest goes to admin, sales, etc.)" />
                <NumberInput label="Working Days Per Week" value={workingDays} onChange={setWorkingDays} suffix="days" min={1} step={1} />
              </div>
            </ResultCard>

            <ResultCard title="Profit Margin" icon="📈">
              <Slider
                label="Profit Margin"
                value={profitMargin}
                onChange={setProfitMargin}
                min={10}
                max={50}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                This covers taxes, savings, growth, and profit. 20% is the minimum recommended for freelancers.
              </p>
            </ResultCard>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-6">
            {/* Big Rate Display */}
            <ResultCard title="Charge This Much" icon="🏷️">
              <div className="text-center py-4">
                <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Your Minimum Hourly Rate</p>
                <p className="text-5xl font-bold mb-1" style={{ color: 'var(--accent)' }}>
                  {fmtWhole(Math.ceil(calc.hourlyRate))}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>per hour</p>
              </div>
            </ResultCard>

            {/* Rate Comparisons */}
            <ResultCard title="Rate Comparison" icon="🔄">
              <div className="grid grid-cols-2 gap-3">
                <MetricBox label="Hourly Rate" value={fmt(calc.hourlyRate)} highlight />
                <MetricBox label="Day Rate" value={fmtWhole(Math.ceil(calc.dayRate))} sub={`${billableHours}h/day`} highlight />
                <MetricBox label="Weekly Rate" value={fmtWhole(Math.ceil(calc.weeklyRate))} sub={`${workingDays} days/week`} />
                <MetricBox label="Monthly Retainer" value={fmtWhole(Math.ceil(calc.monthlyRetainer))} sub="Fixed monthly fee" />
              </div>
            </ResultCard>

            {/* Key Numbers */}
            <ResultCard title="Key Numbers" icon="📊">
              <div className="grid grid-cols-2 gap-3">
                <MetricBox label="Working Weeks" value={calc.workingWeeks} sub={`${52 - calc.workingWeeks} weeks off`} />
                <MetricBox label="Billable Hours / Year" value={calc.totalBillableHours.toLocaleString()} />
                <MetricBox label="Total Annual Costs" value={fmtWhole(calc.totalAnnualCost)} />
                <MetricBox label="Annual Revenue Target" value={fmtWhole(Math.ceil(calc.annualRevenue))} highlight />
                <MetricBox label="Annual Profit" value={fmtWhole(Math.ceil(calc.annualProfit))} sub={`${profitMargin}% margin`} highlight />
                <MetricBox label="Base Cost / Hour" value={fmt(calc.baseCostPerHour)} sub="Before profit margin" />
              </div>
            </ResultCard>

            {/* Cost Breakdown */}
            <ResultCard title="Where Your Money Goes" icon="🥧">
              <div className="space-y-1">
                {costBreakdown.map(item => (
                  <CostBar
                    key={item.label}
                    label={item.label}
                    amount={item.amount}
                    total={calc.totalAnnualCost}
                    color={item.color}
                  />
                ))}
              </div>
              <div
                className="mt-4 p-3 rounded-lg text-center"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Annual Cost Base</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{fmtWhole(calc.totalAnnualCost)}</p>
              </div>
            </ResultCard>

            {/* Quick Reference */}
            <ResultCard title="Quick Reference for Proposals" icon="📝">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Project Size</th>
                      <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Duration</th>
                      <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Quote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { size: 'Small', hours: 10 },
                      { size: 'Medium', hours: 40 },
                      { size: 'Large', hours: 100 },
                      { size: 'Enterprise', hours: 250 },
                    ].map(row => (
                      <tr key={row.size} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2 px-3 font-medium" style={{ color: 'var(--text-heading)' }}>{row.size}</td>
                        <td className="py-2 px-3" style={{ color: 'var(--text-body)' }}>{row.hours} hours</td>
                        <td className="py-2 px-3 text-right font-semibold" style={{ color: 'var(--accent)' }}>
                          {fmtWhole(Math.ceil(calc.hourlyRate * row.hours))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultCard>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <ExportButton elementId="rate-calculator-results" filename="freelance-rate-calculation.pdf" label="Export as PDF" />
        <ShareButton getShareURL={generateShareURL} />
      </div>
    </ToolLayout>
  )
}
