import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import LiveUsers from '../tools/shared/LiveUsers'
import tools, { TOOL_COUNT } from '../config/tools'

const categories = [
  'All',
  'AI Intelligence',
  'Ad Creative & Marketing',
  'Agency Operations',
  'Revenue & Growth',
  'Authority Building',
  'Generator',
]

const categoryColors = {
  'AI Intelligence': { background: 'rgba(168,85,247,0.1)', color: '#a78bfa', border: '1px solid rgba(168,85,247,0.2)' },
  'Ad Creative & Marketing': { background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' },
  'Agency Operations': { background: 'rgba(249,115,22,0.1)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' },
  'Revenue & Growth': { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' },
  'Authority Building': { background: 'rgba(236,72,153,0.1)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.2)' },
  Calculator: { background: 'rgba(6,182,212,0.1)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.2)' },
  Generator: { background: 'rgba(234,179,8,0.1)', color: '#facc15', border: '1px solid rgba(234,179,8,0.2)' },
  Tracker: { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' },
}

const gradientColors = {
  'AI Intelligence': 'linear-gradient(to bottom right, rgba(168,85,247,0.2), rgba(139,92,246,0.2))',
  'Ad Creative & Marketing': 'linear-gradient(to bottom right, rgba(59,130,246,0.2), rgba(6,182,212,0.2))',
  'Agency Operations': 'linear-gradient(to bottom right, rgba(249,115,22,0.2), rgba(245,158,11,0.2))',
  'Revenue & Growth': 'linear-gradient(to bottom right, rgba(16,185,129,0.2), rgba(34,197,94,0.2))',
  'Authority Building': 'linear-gradient(to bottom right, rgba(236,72,153,0.2), rgba(244,63,94,0.2))',
  Calculator: 'linear-gradient(to bottom right, rgba(6,182,212,0.2), rgba(20,184,166,0.2))',
  Generator: 'linear-gradient(to bottom right, rgba(234,179,8,0.2), rgba(245,158,11,0.2))',
  Tracker: 'linear-gradient(to bottom right, rgba(239,68,68,0.2), rgba(249,115,22,0.2))',
}

const borderHoverColors = {
  'AI Intelligence': 'rgba(168,85,247,0.3)',
  'Ad Creative & Marketing': 'rgba(59,130,246,0.3)',
  'Agency Operations': 'rgba(249,115,22,0.3)',
  'Revenue & Growth': 'rgba(16,185,129,0.3)',
  'Authority Building': 'rgba(236,72,153,0.3)',
  Calculator: 'rgba(6,182,212,0.3)',
  Generator: 'rgba(234,179,8,0.3)',
  Tracker: 'rgba(239,68,68,0.3)',
}

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTools = useMemo(() => {
    let result = tools
    if (activeCategory !== 'All') {
      result = result.filter(t => t.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    }
    return result
  }, [activeCategory, searchQuery])

  return (
    <div className="relative">
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 rounded-full"
            style={{
              background: "var(--accent-soft)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              '--duration': `${4 + Math.random() * 8}s`,
              '--delay': `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-soft)", color: "var(--accent)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
              {TOOL_COUNT} Free Tools for Your Business
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight">
              <span style={{ color: "var(--text-heading)" }}>Free Tools for</span>
              <br />
              <span className="animated-gradient-text">Freelancers & Agencies</span>
            </h1>

            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Professional-grade business tools built by{' '}
              <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="transition-colors font-medium" style={{ color: "var(--accent)" }}>
                SKYNET LABS
              </a>
              {' '}&mdash; AI Automation Agency. No sign-up required. Just open and use.
            </p>
          </motion.div>

          {/* Live Users + Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-6 mb-12"
          >
            <LiveUsers />
            <div className="flex items-center justify-center gap-6 sm:gap-10">
              {[
                { value: String(TOOL_COUNT), label: 'Free Tools' },
                { value: '100%', label: 'Free Forever' },
                { value: 'Zero', label: 'Sign-up Required' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-heading)" }}>{stat.value}</div>
                  <div className="text-xs sm:text-sm" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="px-4 sm:px-6 lg:px-8 mb-4">
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none transition-all" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={activeCategory === cat
                  ? { background: 'var(--accent)', color: 'var(--text-on-accent)' }
                  : { background: 'var(--bg-elevated)', color: 'var(--text-muted)' }
                }
              >
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({tools.filter(t => t.category === cat).length})
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tool Cards Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Showing {filteredTools.length} of {tools.length} tools
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.path}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.8) }}
                layout
              >
                <Link
                  to={tool.path}
                  className="group block relative overflow-hidden rounded-2xl backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = borderHoverColors[tool.category] || 'var(--accent-soft)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: gradientColors[tool.category] || 'linear-gradient(to bottom right, rgba(19,185,115,0.2), rgba(16,185,129,0.2))' }} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md"
                        style={categoryColors[tool.category] || { background: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: '1px solid rgba(107,114,128,0.2)' }}>
                        {tool.category}
                      </span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-all" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{tool.emoji}</span>
                      <h3 className="font-bold text-lg transition-colors" style={{ color: "var(--text-heading)" }}>
                        {tool.name}
                      </h3>
                    </div>

                    <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                      {tool.description}
                    </p>

                    <div className="flex items-center gap-2 font-semibold text-sm transition-colors" style={{ color: "var(--accent)" }}>
                      Launch Tool
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>

                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 60px rgba(19, 185, 115, 0.05)' }} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl p-8 sm:p-12 text-center" style={{ border: "1px solid var(--accent-soft)", background: "var(--bg-card)" }}
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl" style={{ background: "var(--accent-soft)" }} />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl" style={{ background: "var(--accent-soft)", opacity: 0.5 }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-soft)", color: "var(--accent)" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
                AI Automation Agency
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold mb-4" style={{ color: "var(--text-heading)" }}>
                Need Custom Automation Solutions?
              </h2>
              <p className="text-base sm:text-lg max-w-xl mx-auto mb-8" style={{ color: "var(--text-muted)" }}>
                We build AI-powered automation systems that save businesses thousands of hours.
                Let us transform your workflows.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://www.skynetjoe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 font-bold rounded-xl transition-all hover:scale-105" style={{ background: "var(--accent)", color: "var(--text-on-accent)" }}
                >
                  Visit skynetjoe.com
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://www.waseemnasir.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-4 font-medium rounded-xl transition-all" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-body)" }}
                >
                  About the Creator
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
