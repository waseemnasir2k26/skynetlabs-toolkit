import { Link } from 'react-router-dom';

const BASE = '/client-onboarding';

export default function Header() {
  return (
    <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <Link to={BASE} className="flex items-center gap-2 no-underline">
            <span className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>Client Onboarding & NDA</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to={BASE} className="text-sm transition-colors hover:opacity-80 no-underline" style={{ color: 'var(--text-muted)' }}>
              Dashboard
            </Link>
            <Link to={`${BASE}/templates`} className="text-sm transition-colors hover:opacity-80 no-underline" style={{ color: 'var(--text-muted)' }}>
              Templates
            </Link>
            <Link to={`${BASE}/settings`} className="text-sm transition-colors hover:opacity-80 no-underline" style={{ color: 'var(--text-muted)' }}>
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
