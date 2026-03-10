import { motion } from 'framer-motion'
import { experienceLevels } from '../data/marketData'

export default function ExperienceSelector({ selected, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card glass-card-hover p-6"
    >
      <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider block mb-4">
        Experience Level
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {experienceLevels.map((level) => {
          const isActive = selected === level.id
          return (
            <button
              key={level.id}
              onClick={() => onChange(level.id)}
              className={`relative p-4 rounded-xl border transition-all duration-300 text-center ${
                isActive
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                  : 'border-white/5 bg-dark-200/50 hover:border-white/10'
              }`}
            >
              <div className={`text-sm font-semibold mb-1 ${isActive ? 'text-primary' : 'text-white'}`}>
                {level.label}
              </div>
              <div className="text-xs text-gray-500">{level.years}</div>
              <div className={`text-xs mt-2 font-mono ${isActive ? 'text-primary/70' : 'text-gray-600'}`}>
                {level.multiplier}x
              </div>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
