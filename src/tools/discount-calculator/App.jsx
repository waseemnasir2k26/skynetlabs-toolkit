import { useMemo } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'

const DISCOUNT_LEVELS = [5, 10, 15, 20, 25]

function fmt(n) {
  const safe = isFinite(n) ? n : 0
  if (Math.abs(safe) >= 1000000) return `$${(safe / 1000000).toFixed(1)}M`
  if (Math.abs(safe) >= 1000) return `$${(safe / 1000).toFixed(1)}K`
  return `$${safe.toFixed(0)}`
}

function pct(n) {
  const safe = isFinite(n) ? n : 0
  return `${safe.toFixed(1)}%`
}

function NumberInput({ label, value, onChange, prefix = '', suffix = '', min = 0, step = 1 }) {
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
          className={`w-full rounded-lg py-2.5 focus:outline-none ${prefix ? 'pl-7 pr-4' : suffix ? 'pl-4 pr-8' : 'px-4'}`}
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>{suffix}</span>
        )}
      </div>
    </div>
  )
}

function MetricBox({ label, value, sub, highlight = false, danger = false }) {
  const bgStyle = danger
    ? { background: 'var(--danger-soft)', borderColor: 'var(--danger)' }
    : highlight
      ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)' }
      : { background: 'var(--bg-elevated)', borderColor: 'var(--border)' }
  const valueColor = danger ? 'var(--danger)' : highlight ? 'var(--accent)' : 'var(--text-heading)'

  return (
    <div className="p-4 rounded-lg border" style={bgStyle}>
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: valueColor }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default function App() {
  const [price, setPrice] = useLocalStorage('skynet-discount-calc-price', 1000)
  const [cogs, setCogs] = useLocalStorage('skynet-discount-calc-cogs', 400)
  const [conversionRate, setConversionRate] = useLocalStorage('skynet-discount-calc-convRate', 5)
  const [unitsSold, setUnitsSold] = useLocalStorage('skynet-discount-calc-units', 100)

  const { generateShareURL } = useShareableURL(
    { price, cogs, conversionRate, unitsSold },
    {
      price: (v) => setPrice(Number(v)),
      cogs: (v) => setCogs(Number(v)),
      conversionRate: (v) => setConversionRate(Number(v)),
      unitsSold: (v) => setUnitsSold(Number(v)),
    }
  )

  const currentMetrics = useMemo(() => {
    const margin = price - cogs
    const marginPct = price > 0 ? (margin / price) * 100 : 0
    const revenue = price * unitsSold
    const profit = margin * unitsSold
    return { margin, marginPct, revenue, profit }
  }, [price, cogs, unitsSold])

  const scenarios = useMemo(() => {
    return DISCOUNT_LEVELS.map(discountPct => {
      const newPrice = price * (1 - discountPct / 100)
      const newMargin = newPrice - cogs
      const newMarginPct = newPrice > 0 ? (newMargin / newPrice) * 100 : 0

      const unitsForSameRevenue = newPrice > 0 ? Math.ceil(currentMetrics.revenue / newPrice) : Infinity
      const unitsForSameProfit = newMargin > 0 ? Math.ceil(currentMetrics.profit / newMargin) : Infinity

      const volumeIncreaseRevenue = unitsSold > 0 ? ((unitsForSameRevenue - unitsSold) / unitsSold) * 100 : Infinity
      const volumeIncreaseProfit = unitsSold > 0 ? ((unitsForSameProfit - unitsSold) / unitsSold) * 100 : Infinity

      const revenueAtSameVolume = newPrice * unitsSold
      const profitAtSameVolume = newMargin * unitsSold

      return {
        discountPct,
        newPrice,
        newMargin,
        newMarginPct,
        unitsForSameRevenue,
        unitsForSameProfit,
        volumeIncreaseRevenue,
        volumeIncreaseProfit,
        revenueAtSameVolume,
        profitAtSameVolume,
      }
    })
  }, [price, cogs, unitsSold, currentMetrics])

  const chartData = useMemo(() => {
    const base = { name: 'Current', Revenue: Math.round(currentMetrics.revenue), Profit: Math.round(currentMetrics.profit) }
    const bars = scenarios.map(s => ({
      name: `${s.discountPct}% Off`,
      Revenue: Math.round(s.revenueAtSameVolume),
      Profit: Math.round(s.profitAtSameVolume),
    }))
    return [base, ...bars]
  }, [currentMetrics, scenarios])

  const alternatives = [
    {
      icon: '📦',
      title: 'Bundle Strategy',
      description: `Instead of ${scenarios[3]?.discountPct || 20}% off, bundle your ${fmt(price)} offering with a complementary service (valued at ${fmt(price * 0.3)}) for ${fmt(price * 1.15)}. Client perceives ${pct(((price + price * 0.3) / (price * 1.15) - 1) * 100)} more value while you increase revenue.`,
    },
    {
      icon: '💳',
      title: 'Payment Plan',
      description: `Offer 3 monthly payments of ${fmt(price / 3)} instead of discounting. Client pays full ${fmt(price)} with easier cash flow. You maintain margin and add a small convenience fee to cover processing.`,
    },
    {
      icon: '🎁',
      title: 'Value-Add Bonus',
      description: `Add a bonus (audit, template, extra revision) worth ${fmt(price * 0.2)} in perceived value but costs you only ${fmt(price * 0.05)} to deliver. Client feels they got a deal without cutting your price.`,
    },
    {
      icon: '⏰',
      title: 'Early Bird / Limited Time',
      description: `Offer ${scenarios[0]?.discountPct || 5}% off (only ${fmt(scenarios[0]?.newPrice || price * 0.95)}) for the first 5 buyers or next 48 hours. Creates urgency without deeply discounting. You sacrifice only ${fmt(price - (scenarios[0]?.newPrice || price * 0.95))} per unit.`,
    },
  ]

  return (
    <ToolLayout
      title="Discount Strategy Calculator"
      description="See the true cost of discounts. Find out exactly how many more sales you need to maintain revenue and profit."
      category="Revenue & Growth"
      icon="🏷️"
    >
      <div id="discount-results">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Inputs */}
          <div className="space-y-6">
            <ResultCard title="Your Numbers" icon="📊">
              <div className="space-y-4">
                <NumberInput label="Original Price" value={price} onChange={setPrice} prefix="$" step={10} />
                <NumberInput label="Cost / COGS" value={cogs} onChange={setCogs} prefix="$" step={10} />
                <NumberInput label="Current Conversion Rate" value={conversionRate} onChange={setConversionRate} suffix="%" step={0.5} />
                <NumberInput label="Current Monthly Units Sold" value={unitsSold} onChange={setUnitsSold} step={1} />
              </div>
            </ResultCard>

            <ResultCard title="Current Baseline" icon="📈">
              <div className="grid grid-cols-2 gap-3">
                <MetricBox label="Price" value={fmt(price)} />
                <MetricBox label="Margin per Unit" value={fmt(currentMetrics.margin)} sub={pct(currentMetrics.marginPct)} />
                <MetricBox label="Monthly Revenue" value={fmt(currentMetrics.revenue)} highlight />
                <MetricBox label="Monthly Profit" value={fmt(currentMetrics.profit)} highlight />
              </div>
            </ResultCard>
          </div>

          {/* RIGHT: Discount Scenarios */}
          <div className="space-y-6">
            <ResultCard title="Discount Impact Analysis" icon="🔢">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th className="text-left py-2 px-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Discount</th>
                      <th className="text-right py-2 px-2 font-semibold" style={{ color: 'var(--text-muted)' }}>New Price</th>
                      <th className="text-right py-2 px-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Margin</th>
                      <th className="text-right py-2 px-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Units for Rev</th>
                      <th className="text-right py-2 px-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Units for Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--accent-soft)' }}>
                      <td className="py-2 px-2 font-semibold" style={{ color: 'var(--accent)' }}>0% (Current)</td>
                      <td className="py-2 px-2 text-right font-medium" style={{ color: 'var(--text-heading)' }}>{fmt(price)}</td>
                      <td className="py-2 px-2 text-right" style={{ color: 'var(--text-heading)' }}>{pct(currentMetrics.marginPct)}</td>
                      <td className="py-2 px-2 text-right" style={{ color: 'var(--text-heading)' }}>{unitsSold}</td>
                      <td className="py-2 px-2 text-right" style={{ color: 'var(--text-heading)' }}>{unitsSold}</td>
                    </tr>
                    {scenarios.map(s => {
                      const isProfitable = s.newMargin > 0
                      return (
                        <tr key={s.discountPct} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="py-2 px-2 font-medium" style={{ color: 'var(--text-heading)' }}>{s.discountPct}% Off</td>
                          <td className="py-2 px-2 text-right" style={{ color: 'var(--text-body)' }}>{fmt(s.newPrice)}</td>
                          <td className="py-2 px-2 text-right" style={{ color: isProfitable ? 'var(--text-body)' : 'var(--danger)' }}>
                            {isProfitable ? pct(s.newMarginPct) : 'LOSS'}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <span style={{ color: 'var(--text-heading)' }}>
                              {isFinite(s.unitsForSameRevenue) ? s.unitsForSameRevenue : 'N/A'}
                            </span>
                            {isFinite(s.volumeIncreaseRevenue) && (
                              <span className="text-xs ml-1" style={{ color: 'var(--danger)' }}>
                                (+{s.volumeIncreaseRevenue.toFixed(0)}%)
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <span style={{ color: 'var(--text-heading)' }}>
                              {isFinite(s.unitsForSameProfit) ? s.unitsForSameProfit : 'N/A'}
                            </span>
                            {isFinite(s.volumeIncreaseProfit) && (
                              <span className="text-xs ml-1" style={{ color: 'var(--danger)' }}>
                                (+{s.volumeIncreaseProfit.toFixed(0)}%)
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                "Units for Rev" = sales needed to match current revenue. "Units for Profit" = sales needed to match current profit. Percentages show the required volume increase.
              </p>
            </ResultCard>

            {/* Break-even highlight */}
            {scenarios.length > 0 && (
              <div className="rounded-xl p-5" style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)' }}>
                <p className="text-sm font-bold mb-2" style={{ color: 'var(--danger)' }}>Break-Even Volume Increase</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {scenarios.filter(s => s.newMargin > 0).map(s => (
                    <div key={s.discountPct} className="text-center">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.discountPct}% discount</p>
                      <p className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>
                        +{isFinite(s.volumeIncreaseProfit) ? s.volumeIncreaseProfit.toFixed(0) : '---'}%
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>more sales needed</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="mt-6">
          <ResultCard title="Revenue & Profit Comparison (Same Volume)" icon="📉">
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              This chart shows what happens to your revenue and profit at each discount level if you sell the same {unitsSold} units.
            </p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => fmt(v)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-heading)',
                    }}
                    formatter={(value) => fmt(value)}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)' }} />
                  <Bar dataKey="Revenue" fill="var(--info)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Profit" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ResultCard>
        </div>

        {/* Alternative Strategies */}
        <div className="mt-6">
          <ResultCard title="Instead of a Deep Discount, Try..." icon="💡">
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Smart alternatives that preserve your margins while still giving clients a reason to buy now.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {alternatives.map((alt, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{alt.icon}</span>
                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>{alt.title}</h4>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>{alt.description}</p>
                </div>
              ))}
            </div>
          </ResultCard>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <ShareButton getShareURL={generateShareURL} />
      </div>
    </ToolLayout>
  )
}
