import { Link, useLocation } from 'react-router-dom'
import { MessageSquareHeart, LayoutDashboard, Heart, Settings, FileText } from 'lucide-react'

const BASE = '/testimonials'

const navItems = [
  { to: `${BASE}`, icon: LayoutDashboard, label: 'Dashboard' },
  { to: `${BASE}/wall`, icon: Heart, label: 'Wall of Love' },
  { to: `${BASE}/collect`, icon: MessageSquareHeart, label: 'Collect' },
  { to: `${BASE}/embed`, icon: FileText, label: 'Embed' },
  { to: `${BASE}/settings`, icon: Settings, label: 'Settings' },
]

export default function Header() {
  const location = useLocation()

  return (
    <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          <Link to={BASE} className="flex items-center gap-2 group">
            <MessageSquareHeart className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-body)' }}>Testimonial Collector</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to || (to === BASE && location.pathname === `${BASE}/`)
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                  style={
                    isActive
                      ? { background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)' }
                      : { color: 'var(--text-muted)' }
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
