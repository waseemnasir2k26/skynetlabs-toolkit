import React from 'react'
import { motion } from 'framer-motion'
import { dimensions } from '../data/questions'

export default function ProgressBar({ current, total, currentDimension }) {
  const percent = ((current + 1) / total) * 100
  const dim = dimensions.find((d) => d.id === currentDimension)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{dim?.icon}</span>
          <span className="text-sm text-gray-400 font-medium">{dim?.label}</span>
        </div>
        <span className="text-sm text-gray-500 font-mono">
          {current + 1} / {total}
        </span>
      </div>
      <div className="w-full h-2 bg-dark-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
