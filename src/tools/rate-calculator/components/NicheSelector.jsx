import { motion } from 'framer-motion'
import { niches } from '../data/marketData'

export default function NicheSelector({ selected, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card glass-card-hover p-6"
    >
      <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider block mb-4">
        Your Niche / Skill
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {niches.map((niche) => {
          const isActive = selected === niche.id
          return (
            <button
              key={niche.id}
              onClick={() => onChange(niche.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                  : 'border-white/5 bg-dark-200/50 hover:border-white/10'
              }`}
            >
              <span className="text-lg">{niche.icon}</span>
              <span className={`text-xs font-medium truncate ${isActive ? 'text-primary' : 'text-gray-300'}`}>
                {niche.label}
              </span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
