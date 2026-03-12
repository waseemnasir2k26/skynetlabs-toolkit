import { useMemo, useState } from 'react'
import { useLocalStorage } from '../shared/hooks/useLocalStorage'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts'
import ToolLayout from '../shared/ToolLayout'
import ResultCard from '../shared/ResultCard'
import ExportButton from '../shared/ExportButton'
import { useShareableURL, ShareButton } from '../shared/useShareableURL'

const fmt = (n) => {
  const safe = isFinite(n) ? n : 0
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(safe)
}

const pct = (n) => {
  const safe = isFinite(n) ? n : 0
  return `${safe.toFixed(1)}%`
}

const CHANNELS = [
  { key: 'seo', label: 'SEO', icon: '\uD83D\uDD0D' },
  { key: 'ppc', label: 'PPC / Paid Ads', icon: '\uD83D\uDCB0' },
  { key: 'social', label: 'Social Media', icon: '\uD83D\uDCF1' },
  { key: 'email', label: 'Email Marketing', icon: '\uD83D\uDCE7' },
  { key: 'content', label: 'Content Marketing', icon: '\uD83D\uDCDD' },
  { key: 'referrals', label: 'Referrals', icon: '\uD83E\uDD1D' },
]

const BAR_COLORS = [
  'var(--accent)',
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#8b5cf6',
]

function NumberInput({ label, value, onChange, prefix = '', min = 0, step = 100 }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
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
          className="w-full rounded-lg py-2 text-sm focus:outline-none"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            color: 'var(--text-heading)',
            paddingLeft: prefix ? '1.75rem' : '0.75rem',
            paddingRight: '0.75rem',
          }}
        />
      </div>
    </div>
  )
}

function MetricBox({ label, value, sub, highlight = false }) {
  return (
    <div
      className="p-4 rounded-lg"
      style={highlight
        ? { background: 'var(--accent-soft)', border: '1px solid var(--accent)' }
        : { background: 'var(--bg-elevated)', border: '1px solid var(--border)' }
      }
    >
      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: highlight ? 'var(--accent)' : 'var(--text-heading)' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

export default function App() {
  const [seoSpend, setSeoSpend] = useLocalStorage('skynet-mroi-seo-spend', 2000)
  const [seoRevenue, setSeoRevenue] = useLocalStorage('skynet-mroi-seo-revenue', 8000)
  const [seoCustomers, setSeoCustomers] = useLocalStorage('skynet-mroi-seo-customers', 10)
  const [ppcSpend, setPpcSpend] = useLocalStorage('skynet-mroi-ppc-spend', 5000)
  const [ppcRevenue, setPpcRevenue] = useLocalStorage('skynet-mroi-ppc-revenue', 12000)
  const [ppcCustomers, setPpcCustomers] = useLocalStorage('skynet-mroi-ppc-customers', 15)
  const [socialSpend, setSocialSpend] = useLocalStorage('skynet-mroi-social-spend', 1500)
  const [socialRevenue, setSocialRevenue] = useLocalStorage('skynet-mroi-social-revenue', 4000)
  const [socialCustomers, setSocialCustomers] = useLocalStorage('skynet-mroi-social-customers', 8)
  const [emailSpend, setEmailSpend] = useLocalStorage('skynet-mroi-email-spend', 500)
  const [emailRevenue, setEmailRevenue] = useLocalStorage('skynet-mroi-email-revenue', 6000)
  const [emailCustomers, setEmailCustomers] = useLocalStorage('skynet-mroi-email-customers', 12)
  const [contentSpend, setContentSpend] = useLocalStorage('skynet-mroi-content-spend', 3000)
  const [contentRevenue, setContentRevenue] = useLocalStorage('skynet-mroi-content-revenue', 7000)
  const [contentCustomers, setContentCustomers] = useLocalStorage('skynet-mroi-content-customers', 9)
  const [referralsSpend, setReferralsSpend] = useLocalStorage('skynet-mroi-referrals-spend', 500)
  const [referralsRevenue, setReferralsRevenue] = useLocalStorage('skynet-mroi-referrals-revenue', 10000)
  const [referralsCustomers, setReferralsCustomers] = useLocalStorage('skynet-mroi-referrals-customers', 5)

  const [reallocationPct, setReallocationPct] = useState(20)

  const channelData = useMemo(() => {
    const raw = [
      { ...CHANNELS[0], spend: seoSpend, revenue: seoRevenue, customers: seoCustomers },
      { ...CHANNELS[1], spend: ppcSpend, revenue: ppcRevenue, customers: ppcCustomers },
      { ...CHANNELS[2], spend: socialSpend, revenue: socialRevenue, customers: socialCustomers },
      { ...CHANNELS[3], spend: emailSpend, revenue: emailRevenue, customers: emailCustomers },
      { ...CHANNELS[4], spend: contentSpend, revenue: contentRevenue, customers: contentCustomers },
      { ...CHANNELS[5], spend: referralsSpend, revenue: referralsRevenue, customers: referralsCustomers },
    ]

    return raw.map(ch => {
      const roi = ch.spend > 0 ? ((ch.revenue - ch.spend) / ch.spend) * 100 : 0
      const cpa = ch.customers > 0 ? ch.spend / ch.customers : 0
      const revenuePerDollar = ch.spend > 0 ? ch.revenue / ch.spend : 0
      return { ...ch, roi, cpa, revenuePerDollar }
    })
  }, [seoSpend, seoRevenue, seoCustomers, ppcSpend, ppcRevenue, ppcCustomers, socialSpend, socialRevenue, socialCustomers, emailSpend, emailRevenue, emailCustomers, contentSpend, contentRevenue, contentCustomers, referralsSpend, referralsRevenue, referralsCustomers])

  const totals = useMemo(() => {
    const totalSpend = channelData.reduce((s, c) => s + c.spend, 0)
    const totalRevenue = channelData.reduce((s, c) => s + c.revenue, 0)
    const totalCustomers = channelData.reduce((s, c) => s + c.customers, 0)
    const overallROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0
    const blendedCAC = totalCustomers > 0 ? totalSpend / totalCustomers : 0
    return { totalSpend, totalRevenue, totalCustomers, overallROI, blendedCAC }
  }, [channelData])

  const recommendation = useMemo(() => {
    const activeChannels = channelData.filter(c => c.spend > 0)
    if (activeChannels.length < 2) return null
    const sorted = [...activeChannels].sort((a, b) => b.roi - a.roi)
    const best = sorted[0]
    const worst = sorted[sorted.length - 1]
    if (best.key === worst.key) return null
    const moveAmount = Math.round(worst.spend * (reallocationPct / 100))
    const projectedExtraRevenue = best.spend > 0 ? moveAmount * (best.revenue / best.spend) : 0
    const lostRevenue = worst.spend > 0 ? moveAmount * (worst.revenue / worst.spend) : 0
    const netGain = projectedExtraRevenue - lostRevenue
    return { best, worst, moveAmount, projectedExtraRevenue, lostRevenue, netGain }
  }, [channelData, reallocationPct])

  const chartData = channelData.map(c => ({
    name: c.label,
    ROI: Math.round(c.roi * 10) / 10,
    'Revenue/$ Spent': Math.round(c.revenuePerDollar * 100) / 100,
  }))

  const spendSetters = [setSeoSpend, setPpcSpend, setSocialSpend, setEmailSpend, setContentSpend, setReferralsSpend]
  const revenueSetters = [setSeoRevenue, setPpcRevenue, setSocialRevenue, setEmailRevenue, setContentRevenue, setReferralsRevenue]
  const customerSetters = [setSeoCustomers, setPpcCustomers, setSocialCustomers, setEmailCustomers, setContentCustomers, setReferralsCustomers]

  const { generateShareURL } = useShareableURL(
    {
      seoS: seoSpend, seoR: seoRevenue, seoC: seoCustomers,
      ppcS: ppcSpend, ppcR: ppcRevenue, ppcC: ppcCustomers,
      socS: socialSpend, socR: socialRevenue, socC: socialCustomers,
      emS: emailSpend, emR: emailRevenue, emC: emailCustomers,
      conS: contentSpend, conR: contentRevenue, conC: contentCustomers,
      refS: referralsSpend, refR: referralsRevenue, refC: referralsCustomers,
    },
    {
      seoS: setSeoSpend, seoR: setSeoRevenue, seoC: setSeoCustomers,
      ppcS: setPpcSpend, ppcR: setPpcRevenue, ppcC: setPpcCustomers,
      socS: setSocialSpend, socR: setSocialRevenue, socC: setSocialCustomers,
      emS: setEmailSpend, emR: setEmailRevenue, emC: setEmailCustomers,
      conS: setContentSpend, conR: setContentRevenue, conC: setContentCustomers,
      refS: setReferralsSpend, refR: setReferralsRevenue, refC: setReferralsCustomers,
    }
  )

  return (
    <ToolLayout
      title="Marketing ROI Calculator"
      description="Compare marketing channel performance, calculate ROI per channel, and get budget reallocation recommendations."
      category="Ad Creative & Marketing"
    >
      <div id="marketing-roi-results">
        {/* Channel Inputs */}
        <ResultCard title="Channel Performance Inputs" icon="&#128200;">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-2 pr-3 font-medium" style={{ color: 'var(--text-muted)' }}>Channel</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Monthly Spend</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Monthly Revenue</th>
                  <th className="text-left py-2 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Customers</th>
                </tr>
              </thead>
              <tbody>
                {CHANNELS.map((ch, idx) => (
                  <tr key={ch.key} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-heading)' }}>
                        <span>{ch.icon}</span> {ch.label}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <NumberInput
                        label=""
                        value={channelData[idx].spend}
                        onChange={spendSetters[idx]}
                        prefix="$"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <NumberInput
                        label=""
                        value={channelData[idx].revenue}
                        onChange={revenueSetters[idx]}
                        prefix="$"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <NumberInput
                        label=""
                        value={channelData[idx].customers}
                        onChange={customerSetters[idx]}
                        prefix=""
                        step={1}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResultCard>

        {/* Overall Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          <MetricBox label="Total Spend" value={fmt(totals.totalSpend)} />
          <MetricBox label="Total Revenue" value={fmt(totals.totalRevenue)} />
          <MetricBox label="Overall ROI" value={pct(totals.overallROI)} highlight={totals.overallROI > 0} />
          <MetricBox label="Blended CAC" value={fmt(totals.blendedCAC)} />
          <MetricBox label="Total Customers" value={totals.totalCustomers} />
        </div>

        {/* Per-Channel Results */}
        <div className="mt-6">
          <ResultCard title="Channel Breakdown" icon="&#128202;">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {channelData.map((ch, idx) => (
                <div
                  key={ch.key}
                  className="rounded-lg p-4 space-y-2"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm" style={{ color: 'var(--text-heading)' }}>
                      {ch.icon} {ch.label}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: ch.roi > 100 ? 'var(--success-soft)' : ch.roi > 0 ? 'var(--accent-soft)' : 'var(--danger-soft)',
                        color: ch.roi > 100 ? 'var(--success)' : ch.roi > 0 ? 'var(--accent)' : 'var(--danger)',
                      }}
                    >
                      {pct(ch.roi)} ROI
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>CPA:</span>{' '}
                      <span className="font-medium" style={{ color: 'var(--text-heading)' }}>{fmt(ch.cpa)}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Rev/$:</span>{' '}
                      <span className="font-medium" style={{ color: 'var(--text-heading)' }}>${ch.revenuePerDollar.toFixed(2)}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Profit:</span>{' '}
                      <span className="font-medium" style={{ color: ch.revenue - ch.spend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {fmt(ch.revenue - ch.spend)}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Customers:</span>{' '}
                      <span className="font-medium" style={{ color: 'var(--text-heading)' }}>{ch.customers}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ResultCard>
        </div>

        {/* ROI Chart */}
        <div className="mt-6">
          <ResultCard title="Channel ROI Comparison" icon="&#128200;">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-heading)',
                    }}
                    formatter={(value, name) => [name === 'ROI' ? `${value}%` : `$${value}`, name]}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)' }} />
                  <Bar dataKey="ROI" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ResultCard>
        </div>

        {/* Budget Reallocation */}
        {recommendation && (
          <div className="mt-6">
            <ResultCard title="Budget Reallocation Recommendation" icon="&#128161;">
              <div className="space-y-4">
                <div
                  className="rounded-lg p-4"
                  style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
                    Move <span style={{ color: 'var(--accent)' }}>{fmt(recommendation.moveAmount)}</span> from{' '}
                    <span style={{ color: 'var(--danger)' }}>{recommendation.worst.label}</span> (ROI: {pct(recommendation.worst.roi)}) to{' '}
                    <span style={{ color: 'var(--success)' }}>{recommendation.best.label}</span> (ROI: {pct(recommendation.best.roi)})
                  </p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-body)' }}>
                    Projected net gain: <span className="font-bold" style={{ color: 'var(--success)' }}>{fmt(recommendation.netGain)}</span>/month
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>Reallocation Percentage</label>
                    <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{reallocationPct}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={reallocationPct}
                    onChange={e => setReallocationPct(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--accent)', background: 'var(--bg-input)' }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    <span>5%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Amount to Move</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{fmt(recommendation.moveAmount)}</p>
                  </div>
                  <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Projected Gain</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--success)' }}>{fmt(recommendation.projectedExtraRevenue)}</p>
                  </div>
                  <div className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenue Lost</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--danger)' }}>{fmt(recommendation.lostRevenue)}</p>
                  </div>
                </div>
              </div>
            </ResultCard>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <ExportButton elementId="marketing-roi-results" filename="marketing-roi-analysis.pdf" label="Export as PDF" />
        <ShareButton getShareURL={generateShareURL} />
      </div>
    </ToolLayout>
  )
}
