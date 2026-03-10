import { motion } from 'framer-motion'
import { pricingTips } from '../data/marketData'

export default function PricingTips() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.95 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-bold text-white mb-5">
        Pricing Strategy <span className="gradient-text">Tips</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pricingTips.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 + i * 0.05 }}
            className="bg-dark-200/50 border border-white/5 rounded-xl p-4 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {i + 1}
              </div>
              <h4 className="text-sm font-semibold text-white">{item.title}</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{item.tip}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
