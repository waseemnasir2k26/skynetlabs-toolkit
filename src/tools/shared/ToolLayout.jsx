export default function ToolLayout({ title, description, icon, proTip, maxWidth = 'default', children }) {
  const width = maxWidth === 'wide' ? 'max-w-7xl' : 'max-w-5xl'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className={`${width} mx-auto px-4 sm:px-6 lg:px-8 py-8`}>
        {/* Hero */}
        <div className="text-center mb-8">
          {icon && (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 text-2xl" style={{ background: 'var(--accent-soft)' }}>
              {icon}
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>{title}</h1>
          {description && (
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-body)' }}>{description}</p>
          )}
        </div>

        {/* Content */}
        <div
          className="rounded-2xl p-5 sm:p-8 mb-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {children}
        </div>

        {/* Pro Tip */}
        {proTip && (
          <div
            className="rounded-xl p-4 mb-6 flex items-start gap-3"
            style={{
              background: 'var(--accent-soft)',
              borderLeft: '3px solid var(--accent)',
              borderRadius: 'var(--radius)',
            }}
          >
            <span className="text-lg flex-shrink-0">💡</span>
            <p className="text-sm" style={{ color: 'var(--text-body)' }}>{proTip}</p>
          </div>
        )}

        {/* CTA */}
        <div
          className="rounded-xl p-6 mb-8 text-center"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            Need custom tools built for your business?
          </p>
          <a
            href="https://www.skynetjoe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            style={{
              background: 'var(--accent)',
              color: 'var(--text-on-accent)',
              borderRadius: 'var(--radius)',
            }}
          >
            Book Free Strategy Call
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Built with ♥ by{' '}
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              SkynetLabs
            </a>
            {' '}· skynetjoe.com
          </p>
        </div>
      </div>
    </div>
  )
}
