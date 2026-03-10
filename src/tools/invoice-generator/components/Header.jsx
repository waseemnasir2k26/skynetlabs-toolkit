import React from 'react'

export default function Header({ onToggleSidebar, sidebarOpen }) {
  return (
    <header className="glass-strong sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-dark-300 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:bg-primary/30 transition-colors">
            <span className="text-primary font-bold text-sm">S</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-wider text-white leading-none">SKYNET LABS</h1>
            <p className="text-[10px] text-gray-500 tracking-wide">AI Automation Agency</p>
          </div>
        </a>
        <div className="hidden sm:block h-6 w-px bg-dark-400 mx-2" />
        <h2 className="text-sm sm:text-base font-semibold text-gray-300">Invoice Generator</h2>
      </div>
      <a
        href="https://www.skynetjoe.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-500 hover:text-primary transition-colors hidden sm:block"
      >
        www.skynetjoe.com
      </a>
    </header>
  )
}
