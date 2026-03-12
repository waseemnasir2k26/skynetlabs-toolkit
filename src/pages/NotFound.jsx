import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center px-4">
        <div className="text-6xl mb-4" style={{ color: 'var(--accent)' }}>404</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>Page Not Found</h1>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors" style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Tools
        </Link>
      </div>
    </div>
  )
}
