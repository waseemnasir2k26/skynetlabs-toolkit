import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getScoreCategory } from '../utils/scoring'

export default function ScoreGauge({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const category = getScoreCategory(score)

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  useEffect(() => {
    let start = 0
    const duration = 2000
    const startTime = Date.now()

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(tick)
    }
    const timer = setTimeout(tick, 300)
    return () => clearTimeout(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="10"
          />
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Score arc */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={category.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: 'easeOut', delay: 0.3 }}
            filter="url(#glow)"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl sm:text-6xl font-black text-white score-number">
            {animatedScore}
          </span>
          <span className="text-gray-500 text-sm font-medium">out of 100</span>
        </div>
      </div>

      {/* Category label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mt-4"
      >
        <span
          className="inline-block px-5 py-2 rounded-full text-white font-bold text-lg"
          style={{ backgroundColor: category.color + '22', color: category.color, border: `2px solid ${category.color}44` }}
        >
          {category.label}
        </span>
      </motion.div>
    </div>
  )
}
