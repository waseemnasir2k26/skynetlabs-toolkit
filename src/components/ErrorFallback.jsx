export default function ErrorFallback({ error, resetError }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-md w-full text-center p-8 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: 'var(--danger-soft)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>
        </div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-heading)' }}>Something broke</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          We logged the issue. Try reloading — most fixes ship within hours.
        </p>
        {error?.message && (
          <pre className="text-xs text-left p-3 mb-5 rounded-lg overflow-auto max-h-32" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {error.message}
          </pre>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={resetError} className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all" style={{ background: 'var(--gradient-brand)', color: 'var(--text-on-accent)' }}>
            Try again
          </button>
          <a href="/" className="px-5 py-2.5 rounded-lg font-medium text-sm transition-all" style={{ background: 'var(--bg-elevated)', color: 'var(--text-body)', border: '1px solid var(--border)' }}>
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
