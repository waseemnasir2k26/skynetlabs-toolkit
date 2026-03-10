import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from '../tools/shared/ThemeToggle'

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
    <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--bg-page) 80%, transparent)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg transition-shadow" style={{ background: "var(--accent)" }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--text-on-accent)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-sm tracking-wider transition-colors" style={{ color: "var(--text-heading)" }}>
                SKYNET LABS
              </div>
              <div className="text-[9px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all" style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Tools
                </Link>
                <div className="h-5 w-px" style={{ background: "var(--border)" }} />
                <span className="text-sm" style={{ color: "var(--text-body)" }}>
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
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all" style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}
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
                <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden animate-fade-in" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div className="p-2" style={{ borderBottom: "1px solid var(--border)" }}>
                    <input
                      type="text"
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-heading)" }}
                      autoFocus
                    />
                  </div>
                  <div className="p-2 max-h-80 overflow-y-auto custom-scrollbar">
                    {filteredTools.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        onClick={() => { setDropdownOpen(false); setSearchQuery('') }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                        style={location.pathname.startsWith(tool.path)
                          ? { background: 'var(--accent-soft)', color: 'var(--accent)' }
                          : { color: 'var(--text-body)' }
                        }
                      >
                        <span className="text-lg">{tool.emoji}</span>
                        <span className="truncate">{tool.name}</span>
                        {location.pathname.startsWith(tool.path) && (
                          <span className="ml-auto w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                        )}
                      </Link>
                    ))}
                    {filteredTools.length === 0 && (
                      <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No tools found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <ThemeToggle />

            {/* Visit skynetjoe.com */}
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all" style={{ color: "var(--accent)", background: "var(--accent-soft)", border: "1px solid var(--accent-soft)" }}
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
            <Link to="/" className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>
              All Tools
            </Link>
            <span style={{ color: "var(--text-muted)" }}>/</span>
            <span className="text-xs" style={{ color: "var(--text-body)" }}>
              {currentTool.emoji} {currentTool.name}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
