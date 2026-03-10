import { motion } from 'framer-motion'
import AnimatedNumber from './AnimatedNumber'
import RateCharts from './RateCharts'
import { marketRates, experienceLevels, niches } from '../data/marketData'

export default function ResultsDashboard({ calculations, niche, experience }) {
  const {
    hourlyRate,
    hourlyLow,
    hourlyHigh,
    projectRate,
    monthlyRetainer,
    annualRevenue,
    profitMargin,
    clientsNeeded,
    marketLow,
    marketMid,
    marketHigh,
  } = calculations

  const nicheLabel = niches.find((n) => n.id === niche)?.label || niche
  const expLabel = experienceLevels.find((e) => e.id === experience)?.label || experience

  const handleShare = async () => {
    const text = `My freelance rate calculation:\n\nHourly: $${Math.round(hourlyRate)}\nProject: $${Math.round(projectRate)}\nRetainer: $${Math.round(monthlyRetainer)}/mo\n\nCalculated with Skynet Labs Freelance Rate Calculator\nhttps://www.skynetjoe.com`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Freelance Rates', text })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text)
      alert('Results copied to clipboard!')
    }
  }

  const cards = [
    {
      label: 'Recommended Hourly Rate',
      value: hourlyRate,
      prefix: '$',
      suffix: '/hr',
      sub: `Range: $${Math.round(hourlyLow)} - $${Math.round(hourlyHigh)}`,
      highlight: true,
    },
    {
      label: 'Suggested Project Rate',
      value: projectRate,
      prefix: '$',
      sub: `Based on avg project scope`,
    },
    {
      label: 'Monthly Retainer',
      value: monthlyRetainer,
      prefix: '$',
      suffix: '/mo',
      sub: `Predictable recurring revenue`,
    },
    {
      label: 'Annual Revenue Projection',
      value: annualRevenue,
      prefix: '$',
      sub: `At your recommended rate`,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Your Rate <span className="gradient-text">Results</span>
        </h2>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-200 border border-white/5 text-gray-300 text-sm hover:border-primary/30 hover:text-primary transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Results
        </button>
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.08 }}
            className={`glass-card p-5 ${card.highlight ? 'pulse-glow border-primary/20' : ''}`}
          >
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{card.label}</div>
            <div className={`text-3xl font-extrabold mb-1 ${card.highlight ? 'gradient-text' : 'text-white'}`}>
              <AnimatedNumber value={card.value} prefix={card.prefix} suffix={card.suffix || ''} />
            </div>
            <div className="text-xs text-gray-500">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Client Breakdown & Profit Margin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <div className="text-sm font-semibold text-gray-300 mb-4">Client Breakdown</div>
          <div className="text-center py-4">
            <div className="text-5xl font-extrabold gradient-text mb-2">
              <AnimatedNumber value={clientsNeeded} decimals={1} />
            </div>
            <div className="text-gray-400 text-sm">
              clients per month at <span className="text-white font-semibold">${Math.round(projectRate)}</span> per project
            </div>
            <div className="text-gray-500 text-xs mt-1">to hit your annual income goal</div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
            <div className="text-center">
              <div className="text-lg font-bold text-white"><AnimatedNumber value={clientsNeeded * 12} decimals={0} /></div>
              <div className="text-xs text-gray-500">Projects/Year</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white"><AnimatedNumber value={projectRate} prefix="$" /></div>
              <div className="text-xs text-gray-500">Avg Project</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white"><AnimatedNumber value={monthlyRetainer} prefix="$" /></div>
              <div className="text-xs text-gray-500">Retainer Alt.</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="glass-card p-6"
        >
          <div className="text-sm font-semibold text-gray-300 mb-4">Profit Margin</div>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#1a1a25" strokeWidth="12" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="url(#profitGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(profitMargin / 100) * 352} 352`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="profitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#13b973" />
                    <stop offset="100%" stopColor="#0ed4e6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-bold text-white font-mono">
                  <AnimatedNumber value={profitMargin} decimals={1} suffix="%" />
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-400 mt-2">
            After taxes and expenses
          </div>
        </motion.div>
      </div>

      {/* Market Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6"
      >
        <div className="text-sm font-semibold text-gray-300 mb-4">
          Market Comparison - {nicheLabel} ({expLabel})
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 w-20">Market Low</span>
            <div className="flex-1 bg-dark-300 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(marketLow / marketHigh) * 100}%` }}
                transition={{ duration: 1, delay: 0.9 }}
                className="h-full rounded-full bg-gray-600"
              />
            </div>
            <span className="text-sm text-gray-400 font-mono w-16 text-right">${Math.round(marketLow)}/hr</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 w-20">Your Rate</span>
            <div className="flex-1 bg-dark-300 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((hourlyRate / marketHigh) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.95 }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              />
            </div>
            <span className="text-sm text-white font-mono font-bold w-16 text-right">${Math.round(hourlyRate)}/hr</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 w-20">Market Avg</span>
            <div className="flex-1 bg-dark-300 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(marketMid / marketHigh) * 100}%` }}
                transition={{ duration: 1, delay: 1.0 }}
                className="h-full rounded-full bg-blue-500/60"
              />
            </div>
            <span className="text-sm text-gray-400 font-mono w-16 text-right">${Math.round(marketMid)}/hr</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 w-20">Market High</span>
            <div className="flex-1 bg-dark-300 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 1.05 }}
                className="h-full rounded-full bg-purple-500/60"
              />
            </div>
            <span className="text-sm text-gray-400 font-mono w-16 text-right">${Math.round(marketHigh)}/hr</span>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <RateCharts calculations={calculations} nicheLabel={nicheLabel} />
    </motion.div>
  )
}
