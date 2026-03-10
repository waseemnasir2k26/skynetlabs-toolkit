import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const tools = [
  {
    path: '/roi-calculator',
    name: 'AI ROI Calculator',
    emoji: '📊',
    description: 'Calculate your automation ROI and potential savings in minutes.',
    category: 'Calculator',
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'hover:border-emerald-500/30',
  },
  {
    path: '/rate-calculator',
    name: 'Freelance Rate Calculator',
    emoji: '💰',
    description: 'Find your perfect hourly, project, and retainer rates.',
    category: 'Calculator',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'hover:border-green-500/30',
  },
  {
    path: '/invoice-generator',
    name: 'Invoice Generator',
    emoji: '📄',
    description: 'Create professional invoices and download as PDF instantly.',
    category: 'Generator',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'hover:border-blue-500/30',
  },
  {
    path: '/proposal-builder',
    name: 'Proposal & Quote Builder',
    emoji: '📋',
    description: 'Build stunning client proposals with live preview and PDF export.',
    category: 'Generator',
    color: 'from-violet-500/20 to-purple-500/20',
    borderColor: 'hover:border-violet-500/30',
  },
  {
    path: '/content-calendar',
    name: 'Content Calendar',
    emoji: '📅',
    description: 'Generate a full content calendar with AI-powered suggestions.',
    category: 'Generator',
    color: 'from-orange-500/20 to-amber-500/20',
    borderColor: 'hover:border-orange-500/30',
  },
  {
    path: '/scope-tracker',
    name: 'Scope Creep Tracker',
    emoji: '🎯',
    description: 'Track scope changes, generate change orders, and protect your profits.',
    category: 'Tracker',
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'hover:border-red-500/30',
  },
  {
    path: '/testimonials',
    name: 'Testimonial Collector',
    emoji: '⭐',
    description: 'Collect, manage, and showcase client testimonials beautifully.',
    category: 'Business Tool',
    color: 'from-yellow-500/20 to-amber-500/20',
    borderColor: 'hover:border-yellow-500/30',
  },
  {
    path: '/project-tracker',
    name: 'Client Project Tracker',
    emoji: '📈',
    description: 'Full project management with Kanban, calendar, and client portals.',
    category: 'Tracker',
    color: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'hover:border-cyan-500/30',
  },
  {
    path: '/ai-quiz',
    name: 'AI Readiness Quiz',
    emoji: '🧠',
    description: 'Assess your business readiness for AI automation adoption.',
    category: 'Business Tool',
    color: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'hover:border-pink-500/30',
  },
  {
    path: '/client-onboarding',
    name: 'Client Onboarding & NDA',
    emoji: '🤝',
    description: 'Professional onboarding forms with NDA, contracts, and e-signatures.',
    category: 'Business Tool',
    color: 'from-indigo-500/20 to-violet-500/20',
    borderColor: 'hover:border-indigo-500/30',
  },
]

const categories = ['All', 'Calculator', 'Generator', 'Tracker', 'Business Tool']

const categoryColors = {
  Calculator: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Generator: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Tracker: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Business Tool': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredTools = useMemo(() => {
    if (activeCategory === 'All') return tools
    return tools.filter(t => t.category === activeCategory)
  }, [activeCategory])

  return (
    <div className="relative">
      {/* Particle/Grid Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              10 Free Tools for Your Business
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="text-white">Free Tools for</span>
              <br />
              <span className="animated-gradient-text">Freelancers & Agencies</span>
            </h1>

            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              Professional-grade business tools built by{' '}
              <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-light transition-colors font-medium">
                SKYNET LABS
              </a>
              {' '}-- AI Automation Agency. No sign-up required. Just open and use.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-6 sm:gap-10 mb-12"
          >
            {[
              { value: '10', label: 'Free Tools' },
              { value: '100%', label: 'Free Forever' },
              { value: 'Zero', label: 'Sign-up Required' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-dark-200/50 text-gray-400 hover:text-white hover:bg-dark-200'
                }`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.path}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                layout
              >
                <Link
                  to={tool.path}
                  className={`group block relative overflow-hidden rounded-2xl border border-white/5 ${tool.borderColor} bg-dark-100/50 backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5`}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    {/* Category Tag */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border ${categoryColors[tool.category]}`}>
                        {tool.category}
                      </span>
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>

                    {/* Icon & Name */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{tool.emoji}</span>
                      <h3 className="text-white font-bold text-lg group-hover:text-primary-light transition-colors">
                        {tool.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {tool.description}
                    </p>

                    {/* Launch Button */}
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:text-primary-light transition-colors">
                      Launch Tool
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>

                  {/* Glow effect on hover */}
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
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-dark-100 to-dark-200 p-8 sm:p-12 text-center"
          >
            {/* Background decoration */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-primary text-xs font-medium mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                AI Automation Agency
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
                Need Custom Automation Solutions?
              </h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-8">
                We build AI-powered automation systems that save businesses thousands of hours.
                Let us transform your workflows.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://www.skynetjoe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105"
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
                  className="inline-flex items-center gap-2 px-6 py-4 bg-dark-200/50 hover:bg-dark-200 border border-white/10 text-gray-300 hover:text-white font-medium rounded-xl transition-all"
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
