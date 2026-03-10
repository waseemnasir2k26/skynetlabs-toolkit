import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'

const fmt = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

const pct = (n) => `${n.toFixed(1)}%`

function NumberInput({ label, value, onChange, prefix = '', suffix = '', min = 0, step = 1 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          step={step}
          className={`w-full bg-dark-200/50 border border-white/10 rounded-lg py-2.5 text-white focus:outline-none focus:border-primary/50 ${
            prefix ? 'pl-7 pr-4' : suffix ? 'pl-4 pr-8' : 'px-4'
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{suffix}</span>
        )}
      </div>
    </div>
  )
}

function Slider({ label, value, onChange, min = 0, max = 100, suffix = '%' }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <span className="text-primary font-semibold text-sm">{value}{suffix}</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        min={min}
        max={max}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-dark-200"
      />
    </div>
  )
}

function MetricBox({ label, value, sub, highlight = false }) {
  return (
    <div className={`p-4 rounded-lg ${highlight ? 'bg-primary/10 border border-primary/30' : 'bg-dark-200/30 border border-white/5'}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-primary' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function App() {
  const [adSpend, setAdSpend] = useState(5000)
  const [cpl, setCpl] = useState(50)
  const [convRate, setConvRate] = useState(10)
  const [avgValue, setAvgValue] = useState(2000)
  const [lifetimeMonths, setLifetimeMonths] = useState(12)
  const [reduceCPL, setReduceCPL] = useState(20)
  const [improveConv, setImproveConv] = useState(15)

  const calc = useMemo(() => {
    const leadsPerMonth = cpl > 0 ? adSpend / cpl : 0
    const customersPerMonth = leadsPerMonth * (convRate / 100)
    const revenuePerMonth = customersPerMonth * avgValue
    const ltv = avgValue * lifetimeMonths
    const ltvRevenue = customersPerMonth * ltv
    const roi = adSpend > 0 ? ((revenuePerMonth - adSpend) / adSpend) * 100 : 0
    const cpa = customersPerMonth > 0 ? adSpend / customersPerMonth : 0

    const optCpl = cpl * (1 - reduceCPL / 100)
    const optConvRate = convRate * (1 + improveConv / 100)
    const optLeads = optCpl > 0 ? adSpend / optCpl : 0
    const optCustomers = optLeads * (optConvRate / 100)
    const optRevenue = optCustomers * avgValue
    const optLtvRevenue = optCustomers * ltv
    const optRoi = adSpend > 0 ? ((optRevenue - adSpend) / adSpend) * 100 : 0
    const optCpa = optCustomers > 0 ? adSpend / optCustomers : 0

    const gap = optRevenue - revenuePerMonth
    const gapLtv = optLtvRevenue - ltvRevenue
    const breakeven = revenuePerMonth > 0 ? adSpend / revenuePerMonth : Infinity

    return {
      leadsPerMonth,
      customersPerMonth,
      revenuePerMonth,
      roi,
      cpa,
      ltvRevenue,
      optLeads,
      optCustomers,
      optRevenue,
      optRoi,
      optCpa,
      optLtvRevenue,
      gap,
      gapLtv,
      breakeven,
    }
  }, [adSpend, cpl, convRate, avgValue, lifetimeMonths, reduceCPL, improveConv])

  const chartData = [
    {
      name: 'Leads/mo',
      Current: Math.round(calc.leadsPerMonth),
      Optimized: Math.round(calc.optLeads),
    },
    {
      name: 'Customers/mo',
      Current: Math.round(calc.customersPerMonth * 10) / 10,
      Optimized: Math.round(calc.optCustomers * 10) / 10,
    },
    {
      name: 'Revenue/mo ($)',
      Current: Math.round(calc.revenuePerMonth),
      Optimized: Math.round(calc.optRevenue),
    },
    {
      name: 'ROI %',
      Current: Math.round(calc.roi),
      Optimized: Math.round(calc.optRoi),
    },
  ]

  return (
    <ToolLayout
      title="Ad Performance ROI Calculator"
      description="Calculate your current ad performance, optimize it with adjustable parameters, and see the revenue gap you're leaving on the table."
    >
      <div id="ad-roi-results">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Inputs */}
          <div className="space-y-6">
            <ResultCard title="Ad Spend Inputs">
              <div className="space-y-4">
                <NumberInput label="Monthly Ad Spend" value={adSpend} onChange={setAdSpend} prefix="$" step={100} />
                <NumberInput label="Current Cost Per Lead (CPL)" value={cpl} onChange={setCpl} prefix="$" step={5} />
                <NumberInput label="Lead-to-Customer Conversion Rate" value={convRate} onChange={setConvRate} suffix="%" step={1} />
                <NumberInput label="Average Customer Value" value={avgValue} onChange={setAvgValue} prefix="$" step={100} />
                <NumberInput label="Average Customer Lifetime (months)" value={lifetimeMonths} onChange={setLifetimeMonths} suffix="mo" step={1} />
              </div>
            </ResultCard>

            <ResultCard title="Optimization Scenarios">
              <div className="space-y-5">
                <Slider label="Reduce CPL by" value={reduceCPL} onChange={setReduceCPL} max={80} />
                <Slider label="Improve Conversion Rate by" value={improveConv} onChange={setImproveConv} max={200} />
              </div>
            </ResultCard>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-6">
            <ResultCard title="Current Performance">
              <div className="grid grid-cols-2 gap-3">
                <MetricBox label="Leads / Month" value={Math.round(calc.leadsPerMonth)} />
                <MetricBox label="Customers / Month" value={calc.customersPerMonth.toFixed(1)} />
                <MetricBox label="Revenue / Month" value={fmt(calc.revenuePerMonth)} />
                <MetricBox label="ROI" value={pct(calc.roi)} highlight={calc.roi > 0} />
                <MetricBox label="Cost Per Acquisition" value={fmt(calc.cpa)} />
                <MetricBox label="LTV Revenue / Month" value={fmt(calc.ltvRevenue)} />
              </div>
            </ResultCard>

            <ResultCard title="Optimized Performance">
              <div className="grid grid-cols-2 gap-3">
                <MetricBox label="Leads / Month" value={Math.round(calc.optLeads)} highlight />
                <MetricBox label="Customers / Month" value={calc.optCustomers.toFixed(1)} highlight />
                <MetricBox label="Revenue / Month" value={fmt(calc.optRevenue)} highlight />
                <MetricBox label="ROI" value={pct(calc.optRoi)} highlight />
                <MetricBox label="Cost Per Acquisition" value={fmt(calc.optCpa)} highlight />
                <MetricBox label="LTV Revenue / Month" value={fmt(calc.optLtvRevenue)} highlight />
              </div>
            </ResultCard>

            <ResultCard title="The Gap">
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm mb-1">You&apos;re leaving on the table every month:</p>
                <p className="text-4xl font-bold text-primary">{fmt(calc.gap)}</p>
                <p className="text-gray-500 text-xs mt-2">
                  Lifetime value gap: {fmt(calc.gapLtv)} / month
                </p>
              </div>
            </ResultCard>

            <ResultCard title="Breakeven Analysis">
              <div className="text-center py-3">
                <p className="text-gray-400 text-sm mb-1">Months to break even on ad spend:</p>
                <p className="text-3xl font-bold text-white">
                  {calc.breakeven === Infinity ? 'N/A' : calc.breakeven.toFixed(1)}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {calc.roi > 0 ? 'You are profitable from month 1!' : 'Optimize your funnel to become profitable faster.'}
                </p>
              </div>
            </ResultCard>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-6">
          <ResultCard title="Before vs. After Comparison">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Bar dataKey="Current" fill="#6b7280" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Optimized" fill="#13b973" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ResultCard>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <ExportButton
          elementId="ad-roi-results"
          filename="ad-roi-analysis.pdf"
          label="Export as PDF"
        />
      </div>
    </ToolLayout>
  )
}
