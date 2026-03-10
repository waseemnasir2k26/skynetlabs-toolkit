import { motion } from 'framer-motion'
import { countries } from '../data/marketData'

export default function TaxCountrySelect({ country, taxRate, onCountryChange, onTaxChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card glass-card-hover p-6"
    >
      <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider block mb-4">
        Tax Information
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Country</label>
          <select
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full bg-dark-200 text-white rounded-lg px-3 py-2.5 text-sm border border-white/5 focus:border-primary/50 outline-none transition-colors appearance-none cursor-pointer"
          >
            {countries.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Effective Tax Rate</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={taxRate}
              onChange={(e) => onTaxChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-white font-bold text-lg w-12 text-right font-mono">{taxRate}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
