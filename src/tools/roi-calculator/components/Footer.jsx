import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full py-8 px-4 mt-auto border-t" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto text-center space-y-3">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Built by{' '}
          <a
            href="https://www.skynetjoe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors font-medium"
            style={{ color: 'var(--accent)' }}
          >
            Skynet Labs
          </a>
          {' '} — AI Automation Agency
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          This calculator provides estimates based on the data you enter. Actual savings may vary.
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} Skynet Labs. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
