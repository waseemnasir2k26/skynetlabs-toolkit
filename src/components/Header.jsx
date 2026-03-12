import { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '../tools/shared/ThemeToggle'
import LiveUsers from '../tools/shared/LiveUsers'
import tools, { TOOL_COUNT } from '../config/tools'

const categoryMeta = {
  'AI Intelligence':        { icon: '\u{1F9E0}', color: '#a78bfa', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)' },
  'Ad Creative & Marketing':{ icon: '\u{1F4E3}', color: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)' },
  'Agency Operations':      { icon: '\u2699\uFE0F', color: '#fb923c', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
  'Revenue & Growth':       { icon: '\u{1F4B0}', color: '#34d399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)' },
  'Authority Building':     { icon: '\u{1F3D7}\uFE0F', color: '#f472b6', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.25)' },
  'Generator':              { icon: '\u{1F527}', color: '#facc15', bg: 'rgba(234,179,8,0.08)',   border: 'rgba(234,179,8,0.25)' },
}

const categoryOrder = [
  'AI Intelligence',
  'Ad Creative & Marketing',
  'Agency Operations',
  'Revenue & Growth',
  'Authority Building',
  'Generator',
]

export default function Header() {
  const location = useLocation()
  const [megaOpen, setMegaOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileAccordion, setMobileAccordion] = useState(null)
  const searchRef = useRef(null)
  const panelRef = useRef(null)

  const currentTool = tools.find(t => location.pathname.startsWith(t.path))

  // Group tools by category (stable)
  const toolsByCategory = useMemo(() => {
    const grouped = {}
    categoryOrder.forEach(cat => { grouped[cat] = [] })
    tools.forEach(t => {
      if (grouped[t.category]) grouped[t.category].push(t)
    })
    return grouped
  }, [])

  // Filtered tools when searching
  const filteredByCategory = useMemo(() => {
    if (!searchQuery.trim()) return toolsByCategory
    const q = searchQuery.toLowerCase()
    const result = {}
    categoryOrder.forEach(cat => {
      const filtered = toolsByCategory[cat].filter(t =>
        t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      )
      if (filtered.length > 0) result[cat] = filtered
    })
    return result
  }, [searchQuery, toolsByCategory])

  const filteredCount = useMemo(() =>
    Object.values(filteredByCategory).reduce((sum, arr) => sum + arr.length, 0)
  , [filteredByCategory])

  // Close on navigation
  useEffect(() => {
    setMegaOpen(false)
    setSearchQuery('')
    setMobileAccordion(null)
  }, [location.pathname])

  // Keyboard: Ctrl+K to toggle, Escape to close
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setMegaOpen(prev => {
          if (!prev) setTimeout(() => searchRef.current?.focus(), 150)
          return !prev
        })
      }
      if (e.key === 'Escape' && megaOpen) {
        setMegaOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [megaOpen])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = megaOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [megaOpen])

  // Focus search when opening
  useEffect(() => {
    if (megaOpen) setTimeout(() => searchRef.current?.focus(), 150)
  }, [megaOpen])

  const closeMega = () => { setMegaOpen(false); setSearchQuery('') }

  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--bg-page) 85%, transparent)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ---- Logo ---- */}
            <Link to="/" className="flex items-center gap-3 group" onClick={closeMega}>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg transition-shadow"
                style={{ background: 'var(--accent)' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-on-accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm tracking-wider" style={{ color: 'var(--text-heading)' }}>SKYNET LABS</div>
                <div className="text-[9px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Free Tools</div>
              </div>
            </Link>

            {/* ---- Center: Current tool breadcrumb (desktop) ---- */}
            <div className="hidden md:flex items-center gap-3">
              {currentTool && (
                <>
                  <Link
                    to="/"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all"
                    style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    All Tools
                  </Link>
                  <div className="h-5 w-px" style={{ background: 'var(--border)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-body)' }}>
                    <span className="mr-1.5">{currentTool.emoji}</span>
                    {currentTool.name}
                  </span>
                </>
              )}
            </div>

            {/* ---- Right side ---- */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <LiveUsers />
              </div>

              {/* Mega Menu Toggle Button */}
              <button
                onClick={() => setMegaOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all"
                style={megaOpen
                  ? { color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent-soft)' }
                  : { color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid transparent' }
                }
                aria-expanded={megaOpen}
                aria-label="Toggle tools menu"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {megaOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
                <span className="hidden sm:inline font-medium">{TOOL_COUNT} Tools</span>
                <span className="sm:hidden text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
                  {TOOL_COUNT}
                </span>
              </button>

              {/* Ctrl+K Search hint (desktop) */}
              <button
                onClick={() => { setMegaOpen(true) }}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg transition-all"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                aria-label="Search tools"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'var(--bg-page)', border: '1px solid var(--border)' }}>
                  Ctrl K
                </kbd>
              </button>

              <ThemeToggle />

              {/* Agency link */}
              <a
                href="https://www.skynetjoe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-all"
                style={{ color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--accent-soft)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                skynetjoe.com
              </a>
            </div>
          </div>

          {/* Mobile breadcrumb */}
          {currentTool && (
            <div className="md:hidden flex items-center gap-2 pb-3 -mt-1">
              <Link to="/" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>All Tools</Link>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="text-xs" style={{ color: 'var(--text-body)' }}>{currentTool.emoji} {currentTool.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* ============= MEGA MENU ============= */}
      <AnimatePresence>
        {megaOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mega-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
              onClick={closeMega}
            />

            {/* Panel */}
            <motion.div
              key="mega-panel"
              ref={panelRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed left-0 right-0 z-50 overflow-hidden"
              style={{
                top: currentTool ? '88px' : '64px',
                background: 'var(--bg-card)',
                borderBottom: '2px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

                {/* Search Bar */}
                <div className="relative mb-5">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder={`Search across ${TOOL_COUNT} tools...`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-24 py-3.5 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-heading)' }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchQuery && (
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        {filteredCount} result{filteredCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ color: 'var(--text-muted)', background: 'var(--bg-page)', border: '1px solid var(--border)' }}>
                      ESC
                    </kbd>
                  </div>
                </div>

                {/* Category stats row */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {categoryOrder.map(cat => {
                    const meta = categoryMeta[cat]
                    const count = toolsByCategory[cat].length
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSearchQuery('')
                          // On mobile, toggle accordion
                          if (window.innerWidth < 768) {
                            setMobileAccordion(prev => prev === cat ? null : cat)
                          } else {
                            // On desktop, scroll the category into view
                            const el = document.getElementById(`mega-cat-${cat.replace(/\s+/g, '-')}`)
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                      >
                        <span className="text-sm">{meta.icon}</span>
                        <span className="hidden sm:inline">{cat}</span>
                        <span className="font-bold">({count})</span>
                      </button>
                    )
                  })}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ color: 'var(--accent)' }}>
                    = {TOOL_COUNT} Total
                  </div>
                </div>

                {/* ---- Desktop: Category columns ---- */}
                <div className="hidden md:block">
                  <div
                    className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 overflow-y-auto custom-scrollbar pr-1"
                    style={{ maxHeight: 'calc(100vh - 320px)' }}
                  >
                    {categoryOrder.map(cat => {
                      const catTools = filteredByCategory[cat]
                      if (!catTools || catTools.length === 0) return null
                      const meta = categoryMeta[cat]
                      return (
                        <div key={cat} id={`mega-cat-${cat.replace(/\s+/g, '-')}`}>
                          {/* Category Header */}
                          <div
                            className="flex items-center gap-2.5 mb-2 pb-2"
                            style={{ borderBottom: `2px solid ${meta.border}` }}
                          >
                            <span className="text-lg">{meta.icon}</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                              {cat}
                            </h3>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
                              style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                            >
                              {toolsByCategory[cat].length}
                            </span>
                          </div>

                          {/* Tool list */}
                          <div className="space-y-px">
                            {catTools.map(tool => {
                              const isActive = location.pathname.startsWith(tool.path)
                              return (
                                <Link
                                  key={tool.path}
                                  to={tool.path}
                                  onClick={closeMega}
                                  className="mega-tool-item group flex items-start gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150"
                                  style={isActive ? { background: 'var(--accent-soft)' } : {}}
                                >
                                  <span className="text-base mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-150">
                                    {tool.emoji}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div
                                      className="text-[13px] font-medium leading-tight transition-colors duration-150"
                                      style={{ color: isActive ? 'var(--accent)' : 'var(--text-heading)' }}
                                    >
                                      {tool.name}
                                    </div>
                                    <div
                                      className="text-[11px] leading-snug mt-0.5 opacity-80"
                                      style={{ color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                    >
                                      {tool.description}
                                    </div>
                                  </div>
                                  {isActive && (
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                                  )}
                                  <svg
                                    className="w-3.5 h-3.5 mt-1 flex-shrink-0 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-150"
                                    style={{ color: 'var(--text-muted)' }}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </Link>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* No results */}
                  {searchQuery && filteredCount === 0 && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">&#128269;</div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>No tools found for "{searchQuery}"</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try a different keyword or browse by category</p>
                    </div>
                  )}
                </div>

                {/* ---- Mobile: Accordion ---- */}
                <div className="md:hidden overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  {categoryOrder.map(cat => {
                    const catTools = filteredByCategory[cat]
                    if (!catTools || catTools.length === 0) return null
                    const meta = categoryMeta[cat]
                    const isOpen = mobileAccordion === cat

                    return (
                      <div key={cat} className="mb-1">
                        <button
                          onClick={() => setMobileAccordion(isOpen ? null : cat)}
                          className="w-full flex items-center justify-between px-3 py-3.5 rounded-xl transition-all"
                          style={isOpen ? { background: meta.bg, border: `1px solid ${meta.border}` } : { border: '1px solid transparent' }}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{meta.icon}</span>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: isOpen ? meta.color : 'var(--text-heading)' }}
                            >
                              {cat}
                            </span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: meta.bg, color: meta.color }}
                            >
                              {toolsByCategory[cat].length}
                            </span>
                          </div>
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            style={{ color: isOpen ? meta.color : 'var(--text-muted)' }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="pl-3 pr-1 pb-2 pt-1">
                                {catTools.map(tool => {
                                  const isActive = location.pathname.startsWith(tool.path)
                                  return (
                                    <Link
                                      key={tool.path}
                                      to={tool.path}
                                      onClick={closeMega}
                                      className="flex items-center gap-2.5 px-3 py-3 rounded-lg transition-all"
                                      style={isActive ? { background: 'var(--accent-soft)' } : {}}
                                    >
                                      <span className="text-base flex-shrink-0">{tool.emoji}</span>
                                      <div className="min-w-0">
                                        <div
                                          className="text-sm font-medium"
                                          style={{ color: isActive ? 'var(--accent)' : 'var(--text-heading)' }}
                                        >
                                          {tool.name}
                                        </div>
                                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                          {tool.description}
                                        </div>
                                      </div>
                                      {isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0" style={{ background: 'var(--accent)' }} />
                                      )}
                                    </Link>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}

                  {/* Mobile no results */}
                  {searchQuery && filteredCount === 0 && (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-2">&#128269;</div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tools found</p>
                    </div>
                  )}
                </div>

                {/* Footer bar */}
                <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                    {TOOL_COUNT} free tools &mdash; No sign-up &middot; 100% client-side &middot; Privacy first
                  </span>
                  <Link
                    to="/"
                    onClick={closeMega}
                    className="text-xs font-semibold flex items-center gap-1 transition-colors"
                    style={{ color: 'var(--accent)' }}
                  >
                    Browse All
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
