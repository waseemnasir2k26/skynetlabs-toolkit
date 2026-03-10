import { motion } from 'framer-motion'
import { expenseCategories } from '../data/marketData'
import AnimatedNumber from './AnimatedNumber'

export default function ExpensesSection({ expenses, onChange }) {
  const total = Object.values(expenses).reduce((a, b) => a + b, 0)

  const handleChange = (id, val) => {
    onChange({ ...expenses, [id]: Math.max(0, Number(val) || 0) })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-card glass-card-hover p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Monthly Business Expenses
        </label>
        <div className="text-lg font-bold text-white">
          <AnimatedNumber value={total} prefix="$" />/mo
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {expenseCategories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 bg-dark-200/50 rounded-lg p-3">
            <span className="text-lg">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-400 truncate">{cat.label}</div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  value={expenses[cat.id]}
                  onChange={(e) => handleChange(cat.id, e.target.value)}
                  className="w-full bg-transparent text-white text-sm font-medium outline-none border-b border-transparent focus:border-primary/50 transition-colors py-0.5"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
        <span className="text-sm text-gray-400">Annual Expenses Total</span>
        <span className="text-lg font-bold gradient-text">
          <AnimatedNumber value={total * 12} prefix="$" />
        </span>
      </div>
    </motion.div>
  )
}
