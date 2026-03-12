import { useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'

const fmt = (n) => {
  const safe = isFinite(n) ? n : 0
  return `$${safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const fmtWhole = (n) => {
  const safe = isFinite(n) ? n : 0
  return `$${safe.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

const pct = (n) => {
  const safe = isFinite(n) ? n : 0
  return `${safe.toFixed(1)}%`
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

const INDUSTRY_BENCHMARKS = [
  { name: 'Freelance Consulting', low: 50, high: 80, icon: '🧑‍💼' },
  { name: 'Creative Agency', low: 20, high: 40, icon: '🎨' },
  { name: 'SaaS / Digital Products', low: 70, high: 90, icon: '💻' },
  { name: 'E-commerce (Physical)', low: 10, high: 30, icon: '📦' },
  { name: 'Web Development', low: 40, high: 70, icon: '🌐' },
  { name: 'Marketing Services', low: 30, high: 50, icon: '📣' },
]

function BenchmarkBar({ name, low, high, icon, currentMargin }) {
  const midpoint = (low + high) / 2
  const isAbove = currentMargin >= midpoint
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm" style={{ color: 'var(--text-body)' }}>{icon} {name}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{low}% - {high}%</span>
      </div>
      <div className="relative w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${low}%`,
            width: `${high - low}%`,
            background: 'var(--info-soft)',
            border: '1px solid var(--info)',
          }}
        />
        {currentMargin > 0 && currentMargin <= 100 && (
          <div
            className="absolute top-0 w-0.5 h-full"
            style={{
              left: `${Math.min(currentMargin, 100)}%`,
              background: isAbove ? 'var(--success)' : 'var(--danger)',
              boxShadow: `0 0 4px ${isAbove ? 'var(--success)' : 'var(--danger)'}`,
            }}
          />
        )}
      </div>
    </div>
  )
}

function MoneyVisual({ keepAmount }) {
  const kept = Math.max(0, Math.min(100, Math.round(keepAmount)))
  const blocks = Array.from({ length: 10 }, (_, i) => {
    const blockValue = (i + 1) * 10
    const isFilled = blockValue <= kept
    const isPartial = !isFilled && blockValue - 10 < kept
    return { isFilled, isPartial, value: blockValue }
  })

  return (
    <div>
      <div className="flex gap-1.5 mb-2">
        {blocks.map((block, i) => (
          <div
            key={i}
            className="flex-1 h-10 rounded-md flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background: block.isFilled
                ? 'var(--accent)'
                : block.isPartial
                  ? 'var(--accent-soft)'
                  : 'var(--bg-elevated)',
              border: block.isFilled || block.isPartial
                ? '1px solid var(--accent)'
                : '1px solid var(--border)',
              color: block.isFilled
                ? 'var(--text-on-accent)'
                : block.isPartial
                  ? 'var(--accent)'
                  : 'var(--text-muted)',
            }}
          >
            ${block.value / 10}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>$0</span>
        <span className="font-medium" style={{ color: 'var(--accent)' }}>
          You keep ${kept} of every $100
        </span>
        <span>$100</span>
      </div>
    </div>
  )
}

export default function App() {
  const [revenue, setRevenue] = useLocalStorage('skynet-profit-margin-revenue', 5000)
  const [cost, setCost] = useLocalStorage('skynet-profit-margin-cost', 2000)
  const [targetMargin, setTargetMargin] = useLocalStorage('skynet-profit-margin-target', 50)

  const { generateShareURL } = useShareableURL(
    { revenue, cost, targetMargin },
    { revenue: setRevenue, cost: setCost, targetMargin: setTargetMargin }
  )

  const calc = useMemo(() => {
    const grossProfit = revenue - cost
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
    const markup = cost > 0 ? (grossProfit / cost) * 100 : 0
    const keepPer100 = grossMargin

    // Price increase scenarios
    const scenarios = [10, 20, 30].map(increase => {
      const newRevenue = revenue * (1 + increase / 100)
      const newProfit = newRevenue - cost
      const newMargin = newRevenue > 0 ? (newProfit / newRevenue) * 100 : 0
      const profitIncrease = grossProfit > 0 ? ((newProfit - grossProfit) / grossProfit) * 100 : 0
      return {
        increase,
        newRevenue,
        newProfit,
        newMargin,
        profitIncrease,
      }
    })

    // Reverse calculator: target margin -> required price
    const requiredPrice = targetMargin < 100 ? cost / (1 - targetMargin / 100) : Infinity
    const requiredMarkup = cost > 0 && targetMargin < 100 ? ((requiredPrice - cost) / cost) * 100 : 0

    return {
      grossProfit,
      grossMargin,
      markup,
      keepPer100,
      scenarios,
      requiredPrice,
      requiredMarkup,
    }
  }, [revenue, cost, targetMargin])

  return (
    <ToolLayout
      title="Profit Margin Calculator"
      description="Instantly calculate your profit margin, markup, and see what happens when you raise prices. Compare against industry benchmarks."
      category="Revenue & Growth"
      icon="💹"
      proTip="Margin and markup are NOT the same thing. A 50% markup only gives you a 33% margin. Always think in margins when setting prices, and compare yourself against industry benchmarks below."
    >
      <div id="profit-margin-results">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Inputs + Visual */}
          <div className="space-y-6">
            <ResultCard title="Enter Your Numbers" icon="📊">
              <div className="space-y-4">
                <NumberInput
                  label="Revenue / Selling Price"
                  value={revenue}
                  onChange={setRevenue}
                  prefix="$"
                  step={100}
                  helpText="What you charge the client"
                />
                <NumberInput
                  label="Cost of Goods / Service Delivery"
                  value={cost}
                  onChange={setCost}
                  prefix="$"
                  step={100}
                  helpText="Your direct costs: labor, software, subcontractors, materials"
                />
              </div>
            </ResultCard>

            {/* Visual: You Keep $X of Every $100 */}
            <ResultCard title="The $100 Test" icon="💵">
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                For every $100 in revenue, here is what you actually keep:
              </p>
              <MoneyVisual keepAmount={calc.keepPer100} />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>You Keep</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>
                    ${Math.round(calc.keepPer100)}
                  </p>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Goes to Costs</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--danger)' }}>
                    ${Math.round(100 - calc.keepPer100)}
                  </p>
                </div>
              </div>
            </ResultCard>

            {/* Reverse Calculator */}
            <ResultCard title="Reverse Calculator" icon="🔄">
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Want a specific margin? Find out what to charge.
              </p>
              <NumberInput
                label="Target Margin"
                value={targetMargin}
                onChange={setTargetMargin}
                suffix="%"
                step={5}
                min={0}
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Charge This Much</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                    {calc.requiredPrice === Infinity ? 'N/A' : fmt(calc.requiredPrice)}
                  </p>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Required Markup</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                    {calc.requiredMarkup === Infinity ? 'N/A' : pct(calc.requiredMarkup)}
                  </p>
                </div>
              </div>
              {revenue > 0 && calc.requiredPrice > revenue && (
                <p className="text-xs mt-2" style={{ color: 'var(--warning)' }}>
                  You would need to increase your price by {fmt(calc.requiredPrice - revenue)} ({pct(((calc.requiredPrice - revenue) / revenue) * 100)}) to hit {targetMargin}% margin.
                </p>
              )}
              {revenue > 0 && calc.requiredPrice <= revenue && calc.requiredPrice !== Infinity && (
                <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>
                  You already exceed this target! Your current margin is {pct(calc.grossMargin)}.
                </p>
              )}
            </ResultCard>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <ResultCard title="Your Margins" icon="🏷️">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <MetricBox label="Gross Profit" value={fmt(calc.grossProfit)} highlight large />
                <MetricBox label="Gross Margin %" value={pct(calc.grossMargin)} highlight large />
                <MetricBox label="Markup %" value={pct(calc.markup)} sub="Cost-based percentage" />
                <MetricBox label="Revenue" value={fmt(revenue)} sub={`Cost: ${fmt(cost)}`} />
              </div>

              {/* Margin vs Markup explainer */}
              <div
                className="p-3 rounded-lg"
                style={{ background: 'var(--info-soft)', border: '1px solid var(--info)' }}
              >
                <p className="text-xs" style={{ color: 'var(--text-body)' }}>
                  <strong style={{ color: 'var(--text-heading)' }}>Margin vs Markup:</strong> Your {pct(calc.markup)} markup gives you a {pct(calc.grossMargin)} margin. Margin = profit / revenue. Markup = profit / cost. They are different!
                </p>
              </div>
            </ResultCard>

            {/* Price Increase Scenarios */}
            <ResultCard title="What If You Raised Prices?" icon="🚀">
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                See how small price increases dramatically boost profit:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Scenario</th>
                      <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>New Price</th>
                      <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Profit</th>
                      <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Margin</th>
                      <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Profit +</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Current baseline */}
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                      <td className="py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Current</td>
                      <td className="py-2 px-3 text-right" style={{ color: 'var(--text-body)' }}>{fmt(revenue)}</td>
                      <td className="py-2 px-3 text-right" style={{ color: 'var(--text-body)' }}>{fmt(calc.grossProfit)}</td>
                      <td className="py-2 px-3 text-right" style={{ color: 'var(--text-body)' }}>{pct(calc.grossMargin)}</td>
                      <td className="py-2 px-3 text-right" style={{ color: 'var(--text-muted)' }}>--</td>
                    </tr>
                    {calc.scenarios.map(s => (
                      <tr key={s.increase} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-2 px-3 font-semibold" style={{ color: 'var(--accent)' }}>+{s.increase}% Price</td>
                        <td className="py-2 px-3 text-right font-medium" style={{ color: 'var(--text-heading)' }}>{fmt(s.newRevenue)}</td>
                        <td className="py-2 px-3 text-right font-medium" style={{ color: 'var(--success)' }}>{fmt(s.newProfit)}</td>
                        <td className="py-2 px-3 text-right" style={{ color: 'var(--text-heading)' }}>{pct(s.newMargin)}</td>
                        <td className="py-2 px-3 text-right font-bold" style={{ color: 'var(--success)' }}>+{pct(s.profitIncrease)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {calc.grossProfit > 0 && (
                <div
                  className="mt-4 p-3 rounded-lg text-center"
                  style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
                >
                  <p className="text-sm" style={{ color: 'var(--text-body)' }}>
                    A <strong style={{ color: 'var(--accent)' }}>10% price increase</strong> would boost your profit by{' '}
                    <strong style={{ color: 'var(--accent)' }}>
                      {fmt(calc.scenarios[0].newProfit - calc.grossProfit)}
                    </strong>{' '}
                    ({pct(calc.scenarios[0].profitIncrease)} more profit)
                  </p>
                </div>
              )}
            </ResultCard>

            {/* Industry Benchmarks */}
            <ResultCard title="Industry Benchmarks" icon="📏">
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                Your margin ({pct(calc.grossMargin)}) compared to industry standards.
                The vertical line shows where you stand.
              </p>
              {INDUSTRY_BENCHMARKS.map(bm => (
                <BenchmarkBar
                  key={bm.name}
                  name={bm.name}
                  low={bm.low}
                  high={bm.high}
                  icon={bm.icon}
                  currentMargin={calc.grossMargin}
                />
              ))}
              <div className="flex items-center gap-3 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded" style={{ background: 'var(--info-soft)', border: '1px solid var(--info)' }} />
                  Industry range
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5" style={{ background: 'var(--success)' }} />
                  Your margin (above midpoint)
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5" style={{ background: 'var(--danger)' }} />
                  Your margin (below midpoint)
                </div>
              </div>
            </ResultCard>

            {/* Margin Cheat Sheet */}
            <ResultCard title="Quick Margin Cheat Sheet" icon="📐">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th className="text-left py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Margin</th>
                      <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Markup</th>
                      <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Multiplier</th>
                      <th className="text-right py-2 px-3 font-medium" style={{ color: 'var(--text-muted)' }}>Keep per $100</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[20, 30, 40, 50, 60, 70, 80].map(margin => {
                      const markupVal = (margin / (100 - margin)) * 100
                      const multiplier = 1 / (1 - margin / 100)
                      const isCurrent = Math.abs(calc.grossMargin - margin) < 5
                      return (
                        <tr
                          key={margin}
                          style={{
                            borderBottom: '1px solid var(--border)',
                            background: isCurrent ? 'var(--accent-soft)' : 'transparent',
                          }}
                        >
                          <td className="py-2 px-3 font-medium" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-heading)' }}>
                            {margin}% {isCurrent ? '(You)' : ''}
                          </td>
                          <td className="py-2 px-3 text-right" style={{ color: 'var(--text-body)' }}>{markupVal.toFixed(0)}%</td>
                          <td className="py-2 px-3 text-right" style={{ color: 'var(--text-body)' }}>{multiplier.toFixed(2)}x</td>
                          <td className="py-2 px-3 text-right font-semibold" style={{ color: 'var(--success)' }}>${margin}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </ResultCard>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <ExportButton elementId="profit-margin-results" filename="profit-margin-analysis.pdf" label="Export as PDF" />
        <ShareButton getShareURL={generateShareURL} />
      </div>
    </ToolLayout>
  )
}
