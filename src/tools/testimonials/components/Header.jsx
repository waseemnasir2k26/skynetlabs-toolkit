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
    <div className="border-b border-white/5 bg-dark-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-12">
          <Link to={BASE} className="flex items-center gap-2 group">
            <MessageSquareHeart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-300">Testimonial Collector</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to || (to === BASE && location.pathname === `${BASE}/`)
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-200'
                  }`}
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
