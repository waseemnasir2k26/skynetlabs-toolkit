import React from 'react'
import { motion } from 'framer-motion'

export default function LandingScreen({ onStart }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-grid">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-green"
        >
          <span className="text-5xl">🤖</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight"
        >
          AI Business Readiness
          <span className="text-gradient block">Quiz</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-lg mb-8 max-w-lg mx-auto"
        >
          Discover how ready your business is for AI automation. Get personalized
          recommendations and a custom action plan in under 5 minutes.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-8 mb-10"
        >
          {[
            { label: 'Questions', value: '16' },
            { label: 'Minutes', value: '<5' },
            { label: 'Dimensions', value: '5' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="px-10 py-4 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary-dark transition-colors glow-green-strong"
        >
          Start Assessment
          <span className="ml-2">→</span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-gray-600 text-sm"
        >
          Free assessment by{' '}
          <a
            href="https://www.skynetjoe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Skynet Labs
          </a>
        </motion.p>
      </motion.div>
    </div>
  )
}
