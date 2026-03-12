export default function Footer() {
  return (
    <footer className="border-t mt-auto" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-body)' }}>
            <span>Powered by</span>
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold transition-colors hover:opacity-80"
              style={{ color: 'var(--accent)' }}
            >
              SKYNET LABS
            </a>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <span style={{ color: 'var(--text-muted)' }}>AI Automation Agency</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://www.skynetjoe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:opacity-80"
              style={{ color: 'var(--text-body)' }}
            >
              Visit skynetjoe.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
