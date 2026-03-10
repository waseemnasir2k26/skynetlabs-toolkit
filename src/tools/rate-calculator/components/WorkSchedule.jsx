import { motion } from 'framer-motion'

export default function WorkSchedule({ billableHours, weeksOff, onHoursChange, onWeeksOffChange }) {
  const billableWeeks = 52 - weeksOff
  const annualHours = billableHours * billableWeeks

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card glass-card-hover p-6"
    >
      <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider block mb-4">
        Work Schedule
      </label>
      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Billable Hours Per Week</span>
            <span className="text-white font-bold font-mono">{billableHours}h</span>
          </div>
          <input
            type="range"
            min={20}
            max={40}
            step={1}
            value={billableHours}
            onChange={(e) => onHoursChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>20h</span>
            <span>30h</span>
            <span>40h</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Weeks Off Per Year</span>
            <span className="text-white font-bold font-mono">{weeksOff} weeks</span>
          </div>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={weeksOff}
            onChange={(e) => onWeeksOffChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>2 weeks</span>
            <span>5 weeks</span>
            <span>8 weeks</span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
          <span className="text-sm text-gray-400">Total Billable Hours/Year</span>
          <span className="text-lg font-bold gradient-text font-mono">{annualHours.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  )
}
