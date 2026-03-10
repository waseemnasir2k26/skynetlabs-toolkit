import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllResults, clearResults } from '../utils/storage'
import { getScoreCategory } from '../utils/scoring'

export default function AdminPanel({ onClose }) {
  const [results, setResults] = useState(getAllResults())
  const [confirmClear, setConfirmClear] = useState(false)

  const handleClear = () => {
    if (confirmClear) {
      clearResults()
      setResults([])
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
    }
  }

  const avgScore =
    results.length > 0
      ? Math.round(results.reduce((s, r) => s + r.scores.overall, 0) / results.length)
      : 0

  const scoreDist = { 'Not Ready': 0, 'Getting Started': 0, 'Almost Ready': 0, 'AI Ready': 0 }
  results.forEach((r) => {
    const cat = getScoreCategory(r.scores.overall)
    scoreDist[cat.label]++
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-dark-500/95 backdrop-blur-lg overflow-auto"
    >
      <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Analytics</h1>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-dark-200/50 border border-white/5 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary">{results.length}</div>
            <div className="text-xs text-gray-500 mt-1">Total Completions</div>
          </div>
          <div className="bg-dark-200/50 border border-white/5 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-primary">{avgScore}</div>
            <div className="text-xs text-gray-500 mt-1">Average Score</div>
          </div>
          <div className="bg-dark-200/50 border border-white/5 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{scoreDist['AI Ready']}</div>
            <div className="text-xs text-gray-500 mt-1">AI Ready</div>
          </div>
          <div className="bg-dark-200/50 border border-white/5 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{scoreDist['Getting Started']}</div>
            <div className="text-xs text-gray-500 mt-1">Getting Started</div>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-dark-200/50 border border-white/5 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Score Distribution</h2>
          <div className="space-y-3">
            {Object.entries(scoreDist).map(([label, count]) => {
              const pct = results.length > 0 ? (count / results.length) * 100 : 0
              const colors = {
                'Not Ready': '#ef4444',
                'Getting Started': '#f59e0b',
                'Almost Ready': '#3b82f6',
                'AI Ready': '#13b973',
              }
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-gray-500">{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-3 bg-dark-400 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: colors[label] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Results list */}
        <div className="bg-dark-200/50 border border-white/5 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Recent Submissions</h2>
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No quiz completions yet.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto">
              {[...results].reverse().map((r) => {
                const cat = getScoreCategory(r.scores.overall)
                const date = new Date(r.timestamp)
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-dark-300/50 border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: cat.color + '22', color: cat.color }}
                      >
                        {r.scores.overall}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{cat.label}</div>
                        <div className="text-xs text-gray-500">
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex gap-2">
                      {Object.entries(r.scores.dimensions).map(([dim, score]) => (
                        <div
                          key={dim}
                          className="text-xs text-gray-500 bg-dark-400 rounded px-2 py-1"
                          title={dim}
                        >
                          {dim.slice(0, 3)}: {score}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Clear */}
        <div className="text-center">
          <button
            onClick={handleClear}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              confirmClear
                ? 'bg-red-600 text-white'
                : 'bg-dark-200 text-gray-400 border border-white/5 hover:text-red-400'
            }`}
          >
            {confirmClear ? 'Click again to confirm' : 'Clear All Data'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
