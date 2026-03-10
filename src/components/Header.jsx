import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const tools = [
  // Original 10
  { path: '/roi-calculator', name: 'AI ROI Calculator', emoji: '📊' },
  { path: '/rate-calculator', name: 'Freelance Rate Calculator', emoji: '💰' },
  { path: '/invoice-generator', name: 'Invoice Generator', emoji: '📄' },
  { path: '/proposal-builder', name: 'Proposal Builder', emoji: '📋' },
  { path: '/content-calendar', name: 'Content Calendar', emoji: '📅' },
  { path: '/scope-tracker', name: 'Scope Creep Tracker', emoji: '🎯' },
  { path: '/testimonials', name: 'Testimonial Collector', emoji: '⭐' },
  { path: '/project-tracker', name: 'Project Tracker', emoji: '📈' },
  { path: '/ai-quiz', name: 'AI Readiness Quiz', emoji: '🧠' },
  { path: '/client-onboarding', name: 'Client Onboarding', emoji: '🤝' },
  // Phase 1: AI Intelligence
  { path: '/brief-analyzer', name: 'Brief Analyzer', emoji: '🔍' },
  { path: '/fire-or-keep', name: 'Fire or Keep', emoji: '🔥' },
  { path: '/niche-scanner', name: 'Niche Scanner', emoji: '🔬' },
  { path: '/sow-generator', name: 'SOW Generator', emoji: '📝' },
  { path: '/client-health', name: 'Client Health', emoji: '💊' },
  { path: '/meeting-manager', name: 'Meeting Manager', emoji: '📞' },
  { path: '/positioning-generator', name: 'Positioning', emoji: '🏆' },
  // Phase 2: Ad Creative & Marketing
  { path: '/ad-brief-generator', name: 'Ad Brief', emoji: '📢' },
  { path: '/ad-copy-generator', name: 'Ad Copy', emoji: '✍️' },
  { path: '/campaign-strategy', name: 'Campaign Strategy', emoji: '🗺️' },
  { path: '/landing-page-copy', name: 'Landing Page Copy', emoji: '🖥️' },
  { path: '/ad-roi-calculator', name: 'Ad ROI Calculator', emoji: '📉' },
  { path: '/ad-specs-guide', name: 'Ad Specs Guide', emoji: '📐' },
  { path: '/competitor-angles', name: 'Competitor Angles', emoji: '🎯' },
  // Phase 3: Agency Operations
  { path: '/command-center', name: 'Command Center', emoji: '🖥️' },
  { path: '/onboarding-portal', name: 'Onboarding Portal', emoji: '🚪' },
  { path: '/scope-change', name: 'Scope Change', emoji: '📋' },
  { path: '/productize-services', name: 'Productize Services', emoji: '📦' },
  { path: '/post-mortem', name: 'Post-Mortem', emoji: '🔎' },
  { path: '/client-report', name: 'Client Report', emoji: '📊' },
  // Phase 4: Revenue & Growth
  { path: '/micro-crm', name: 'Micro-CRM', emoji: '🔄' },
  { path: '/service-configurator', name: 'Service Configurator', emoji: '⚙️' },
  { path: '/revenue-goal', name: 'Revenue Goal', emoji: '🎯' },
  { path: '/revenue-diversification', name: 'Revenue Diversification', emoji: '🥧' },
  { path: '/win-back-campaigns', name: 'Win-Back Campaigns', emoji: '📧' },
  // Phase 5: Authority Building
  { path: '/content-planner', name: 'Content Planner', emoji: '📆' },
  { path: '/social-proof-manager', name: 'Social Proof', emoji: '🌟' },
  { path: '/business-scorecard', name: 'Business Scorecard', emoji: '💯' },
  { path: '/website-audit', name: 'Website Audit', emoji: '🔍' },
  { path: '/lead-magnet-factory', name: 'Lead Magnet', emoji: '🧲' },
]

export default function Header() {
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)

  const currentTool = tools.find(t => location.pathname.startsWith(t.path))

  const filteredTools = searchQuery.trim()
    ? tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : tools

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setDropdownOpen(false)
    setSearchQuery('')
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-dark/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm tracking-wider group-hover:text-primary transition-colors">
                SKYNET LABS
              </div>
              <div className="text-gray-500 text-[9px] tracking-widest uppercase">
                Free Tools
              </div>
            </div>
          </Link>

          {/* Center: Current tool */}
          <div className="hidden md:flex items-center gap-3">
            {currentTool && (
              <>
                <Link
                  to="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-dark-200/50 hover:bg-dark-200 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Tools
                </Link>
                <div className="h-5 w-px bg-white/10" />
                <span className="text-sm text-gray-300">
                  <span className="mr-1.5">{currentTool.emoji}</span>
                  {currentTool.name}
                </span>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Tool Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white bg-dark-200/50 hover:bg-dark-200 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline">Tools</span>
                <svg className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-dark-100 border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in">
                  <div className="p-2 border-b border-white/5">
                    <input
                      type="text"
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-dark-200/50 border border-white/5 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/30"
                      autoFocus
                    />
                  </div>
                  <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                    {filteredTools.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => { setDropdownOpen(false); setSearchQuery('') }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                          location.pathname.startsWith(tool.path)
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-300 hover:bg-dark-200 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">{tool.emoji}</span>
                        <span className="truncate">{tool.name}</span>
                        {location.pathname.startsWith(tool.path) && (
                          <span className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </Link>
                    ))}
                    {filteredTools.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">No tools found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Visit skynetjoe.com */}
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-primary hover:text-primary-light bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              skynetjoe.com
            </a>
          </div>
        </div>

        {/* Mobile: Show current tool name */}
        {currentTool && (
          <div className="md:hidden flex items-center gap-2 pb-3 -mt-1">
            <Link to="/" className="text-xs text-gray-500 hover:text-primary transition-colors">
              All Tools
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-xs text-gray-300">
              {currentTool.emoji} {currentTool.name}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
