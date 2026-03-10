import { motion } from 'framer-motion'
import AnimatedNumber from './AnimatedNumber'

export default function IncomeSlider({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card glass-card-hover p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Desired Annual Income
        </label>
        <div className="text-2xl font-bold text-white">
          <AnimatedNumber value={value} prefix="$" />
        </div>
      </div>
      <input
        type="range"
        min={30000}
        max={500000}
        step={5000}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>$30K</span>
        <span>$250K</span>
        <span>$500K</span>
      </div>
    </motion.div>
  )
}
