import React from 'react'

export default function Header() {
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a
          href="https://www.skynetjoe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300" style={{ background: 'linear-gradient(to bottom right, var(--accent), var(--accent))' }}>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" style={{ color: 'var(--text-on-accent)' }}>
                <path d="M12 2L2 19h20L12 2zm0 4l7 13H5l7-13z" />
                <circle cx="12" cy="15" r="1.5" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wider" style={{ color: 'var(--text-heading)' }}>
              SKYNET LABS
            </h1>
            <p className="text-[10px] sm:text-xs tracking-widest uppercase -mt-0.5" style={{ color: 'var(--accent)' }}>
              AI Automation Agency
            </p>
          </div>
        </a>
        <a
          href="https://www.skynetjoe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm transition-all duration-300"
          style={{ color: 'var(--accent)' }}
        >
          <span>Visit Website</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </header>
  )
}
