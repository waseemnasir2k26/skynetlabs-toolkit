import React from 'react'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-500/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a
          href="https://www.skynetjoe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-primary font-black text-sm font-mono">SL</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm tracking-widest">SKYNET LABS</span>
            <span className="text-gray-500 text-[10px] tracking-wider uppercase">
              AI Automation Agency
            </span>
          </div>
        </a>
        <a
          href="https://www.skynetjoe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          Visit Website
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </header>
  )
}
