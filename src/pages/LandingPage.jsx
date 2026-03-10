import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const tools = [
  // Original 10
  { path: '/roi-calculator', name: 'AI ROI Calculator', emoji: '📊', description: 'Calculate your automation ROI and potential savings in minutes.', category: 'Calculator' },
  { path: '/rate-calculator', name: 'Freelance Rate Calculator', emoji: '💰', description: 'Find your perfect hourly, project, and retainer rates.', category: 'Calculator' },
  { path: '/invoice-generator', name: 'Invoice Generator', emoji: '📄', description: 'Create professional invoices and download as PDF instantly.', category: 'Generator' },
  { path: '/proposal-builder', name: 'Proposal & Quote Builder', emoji: '📋', description: 'Build stunning client proposals with live preview and PDF export.', category: 'Generator' },
  { path: '/content-calendar', name: 'Content Calendar', emoji: '📅', description: 'Generate a full content calendar with AI-powered suggestions.', category: 'Generator' },
  { path: '/scope-tracker', name: 'Scope Creep Tracker', emoji: '🎯', description: 'Track scope changes, generate change orders, and protect your profits.', category: 'Agency Operations' },
  { path: '/testimonials', name: 'Testimonial Collector', emoji: '⭐', description: 'Collect, manage, and showcase client testimonials beautifully.', category: 'Authority Building' },
  { path: '/project-tracker', name: 'Client Project Tracker', emoji: '📈', description: 'Full project management with Kanban, calendar, and client portals.', category: 'Agency Operations' },
  { path: '/ai-quiz', name: 'AI Readiness Quiz', emoji: '🧠', description: 'Assess your business readiness for AI automation adoption.', category: 'AI Intelligence' },
  { path: '/client-onboarding', name: 'Client Onboarding & NDA', emoji: '🤝', description: 'Professional onboarding forms with NDA, contracts, and e-signatures.', category: 'Agency Operations' },
  // Phase 1: AI Intelligence
  { path: '/brief-analyzer', name: 'Client Brief Analyzer', emoji: '🔍', description: 'Paste any client brief. Extract deliverables, flag scope creep risks, estimate hours.', category: 'AI Intelligence' },
  { path: '/fire-or-keep', name: 'Fire or Keep Analyzer', emoji: '🔥', description: 'Should you keep this client? Get a data-driven verdict with actionable advice.', category: 'AI Intelligence' },
  { path: '/niche-scanner', name: 'Niche Profitability Scanner', emoji: '🔬', description: 'Analyze any freelance niche for demand, rates, competition, and growth.', category: 'AI Intelligence' },
  { path: '/sow-generator', name: 'SOW Generator', emoji: '📝', description: 'Generate a complete Statement of Work with milestones and payment terms.', category: 'AI Intelligence' },
  { path: '/client-health', name: 'Client Health Dashboard', emoji: '💊', description: 'Track all clients. See health scores, spot deteriorating relationships.', category: 'AI Intelligence' },
  { path: '/meeting-manager', name: 'Meeting Lifecycle Manager', emoji: '📞', description: 'Get structured agendas before meetings, action items after.', category: 'AI Intelligence' },
  { path: '/positioning-generator', name: 'Competitive Positioning', emoji: '🏆', description: 'Map competitors, find gaps, generate your unique positioning strategy.', category: 'AI Intelligence' },
  // Phase 2: Ad Creative & Marketing
  { path: '/ad-brief-generator', name: 'Ad Creative Brief', emoji: '📢', description: 'Get a complete ad creative brief with angles, copy, and targeting.', category: 'Ad Creative & Marketing' },
  { path: '/ad-copy-generator', name: 'Ad Copy Generator', emoji: '✍️', description: 'Platform-specific ad copy with proper character limits.', category: 'Ad Creative & Marketing' },
  { path: '/campaign-strategy', name: 'Campaign Strategy Builder', emoji: '🗺️', description: 'Complete 30-day campaign plan with channel allocation and calendar.', category: 'Ad Creative & Marketing' },
  { path: '/landing-page-copy', name: 'Landing Page Copy', emoji: '🖥️', description: 'Complete landing page copy structured for conversion.', category: 'Ad Creative & Marketing' },
  { path: '/ad-roi-calculator', name: 'Ad ROI Calculator', emoji: '📉', description: 'Show clients their current ad ROI and projected improvements.', category: 'Ad Creative & Marketing' },
  { path: '/ad-specs-guide', name: 'Ad Specs & Size Guide', emoji: '📐', description: 'Every platform ad format — dimensions, limits, and best practices.', category: 'Ad Creative & Marketing' },
  { path: '/competitor-angles', name: 'Competitor Angle Finder', emoji: '🎯', description: 'Generate counter-positioning angles with ad headlines and concepts.', category: 'Ad Creative & Marketing' },
  // Phase 3: Agency Operations
  { path: '/command-center', name: 'Client Command Center', emoji: '🖥️', description: 'Single-screen dashboard for every client, project, and deadline.', category: 'Agency Operations' },
  { path: '/onboarding-portal', name: 'Onboarding Portal', emoji: '🚪', description: 'Branded portal where new clients complete onboarding steps.', category: 'Agency Operations' },
  { path: '/scope-change', name: 'Scope Change System', emoji: '📋', description: 'Log scope changes, calculate cost, generate change requests.', category: 'Agency Operations' },
  { path: '/productize-services', name: 'Service Productizer', emoji: '📦', description: 'Transform custom services into scalable, productized packages.', category: 'Agency Operations' },
  { path: '/post-mortem', name: 'Project Post-Mortem', emoji: '🔎', description: 'Capture wins, failures, and budget vs actual after each project.', category: 'Agency Operations' },
  { path: '/client-report', name: 'Client Report Builder', emoji: '📊', description: 'Drag-and-drop report builder with metrics, tasks, and PDF export.', category: 'Agency Operations' },
  // Phase 4: Revenue & Growth
  { path: '/micro-crm', name: 'Pipeline Micro-CRM', emoji: '🔄', description: 'The anti-HubSpot. Track leads, follow-ups, proposals, and revenue.', category: 'Revenue & Growth' },
  { path: '/service-configurator', name: 'Services Configurator', emoji: '⚙️', description: 'Clients build their own custom quote with live price updates.', category: 'Revenue & Growth' },
  { path: '/revenue-goal', name: 'Revenue Goal Planner', emoji: '🎯', description: 'Set your income goal. See exactly how many clients and leads you need.', category: 'Revenue & Growth' },
  { path: '/revenue-diversification', name: 'Revenue Diversification', emoji: '🥧', description: 'Visualize income concentration risk and run what-if scenarios.', category: 'Revenue & Growth' },
  { path: '/win-back-campaigns', name: 'Win-Back Campaigns', emoji: '📧', description: 'Segmented, personalized re-engagement email sequences for past clients.', category: 'Revenue & Growth' },
  // Phase 5: Authority Building
  { path: '/content-planner', name: '90-Day Content Planner', emoji: '📆', description: '90-day content calendar mapped to your sales funnel.', category: 'Authority Building' },
  { path: '/social-proof-manager', name: 'Social Proof Manager', emoji: '🌟', description: 'Collect, organize, and deploy testimonials with embeddable widgets.', category: 'Authority Building' },
  { path: '/business-scorecard', name: 'Business Health Scorecard', emoji: '💯', description: '50-question diagnostic covering every aspect of your freelance business.', category: 'Authority Building' },
  { path: '/website-audit', name: 'Website Conversion Audit', emoji: '🔍', description: '20-point conversion optimization report with fix recommendations.', category: 'Authority Building' },
  { path: '/lead-magnet-factory', name: 'Lead Magnet Factory', emoji: '🧲', description: 'Create a lead magnet AND its landing page in one workflow.', category: 'Authority Building' },
]

const categories = [
  'All',
  'AI Intelligence',
  'Ad Creative & Marketing',
  'Agency Operations',
  'Revenue & Growth',
  'Authority Building',
  'Calculator',
  'Generator',
]

const categoryColors = {
  'AI Intelligence': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Ad Creative & Marketing': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Agency Operations': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Revenue & Growth': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Authority Building': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Calculator: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Generator: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Tracker: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const gradientColors = {
  'AI Intelligence': 'from-purple-500/20 to-violet-500/20',
  'Ad Creative & Marketing': 'from-blue-500/20 to-cyan-500/20',
  'Agency Operations': 'from-orange-500/20 to-amber-500/20',
  'Revenue & Growth': 'from-emerald-500/20 to-green-500/20',
  'Authority Building': 'from-pink-500/20 to-rose-500/20',
  Calculator: 'from-cyan-500/20 to-teal-500/20',
  Generator: 'from-yellow-500/20 to-amber-500/20',
  Tracker: 'from-red-500/20 to-orange-500/20',
}

const borderHover = {
  'AI Intelligence': 'hover:border-purple-500/30',
  'Ad Creative & Marketing': 'hover:border-blue-500/30',
  'Agency Operations': 'hover:border-orange-500/30',
  'Revenue & Growth': 'hover:border-emerald-500/30',
  'Authority Building': 'hover:border-pink-500/30',
  Calculator: 'hover:border-cyan-500/30',
  Generator: 'hover:border-yellow-500/30',
  Tracker: 'hover:border-red-500/30',
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
              40 Free Tools for Your Business
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
              {' '}&mdash; AI Automation Agency. No sign-up required. Just open and use.
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
              { value: '40', label: 'Free Tools' },
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

      {/* Search Bar */}
      <section className="px-4 sm:px-6 lg:px-8 mb-4">
        <div className="max-w-xl mx-auto">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-100/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
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
          <div className="text-sm text-gray-500 mb-4">
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
                  className={`group block relative overflow-hidden rounded-2xl border border-white/5 ${borderHover[tool.category] || 'hover:border-primary/30'} bg-dark-100/50 backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[tool.category] || 'from-primary/20 to-emerald-500/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border ${categoryColors[tool.category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        {tool.category}
                      </span>
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{tool.emoji}</span>
                      <h3 className="text-white font-bold text-lg group-hover:text-primary-light transition-colors">
                        {tool.name}
                      </h3>
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                      {tool.description}
                    </p>

                    <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:text-primary-light transition-colors">
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
            className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-dark-100 to-dark-200 p-8 sm:p-12 text-center"
          >
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
