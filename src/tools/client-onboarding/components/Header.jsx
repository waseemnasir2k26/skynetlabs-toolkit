import { Link } from 'react-router-dom';

const BASE = '/client-onboarding';

export default function Header() {
  return (
    <div className="border-b border-white/5 bg-dark-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <Link to={BASE} className="flex items-center gap-2 no-underline">
            <span className="text-sm font-medium text-gray-300">Client Onboarding & NDA</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to={BASE} className="text-sm text-gray-400 hover:text-primary transition-colors no-underline">
              Dashboard
            </Link>
            <Link to={`${BASE}/templates`} className="text-sm text-gray-400 hover:text-primary transition-colors no-underline">
              Templates
            </Link>
            <Link to={`${BASE}/settings`} className="text-sm text-gray-400 hover:text-primary transition-colors no-underline">
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
