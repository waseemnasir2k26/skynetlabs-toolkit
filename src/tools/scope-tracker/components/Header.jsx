import React from 'react';

export default function Header({ currentView, onNavigate, hasActiveProject }) {
  const tabStyle = (active) => ({
    background: active ? 'var(--accent-soft)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    border: active ? '1px solid var(--accent-soft)' : '1px solid transparent',
  })

  return (
    <div className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <button onClick={() => onNavigate('projects')} className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--text-heading)' }}>
          Scope Creep Tracker
        </button>

        {hasActiveProject && (
          <nav className="flex items-center gap-1">
            {['dashboard', 'analytics', 'change-orders'].map((view) => (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={tabStyle(currentView === view)}
              >
                {view === 'dashboard'
                  ? 'Dashboard'
                  : view === 'analytics'
                  ? 'Analytics'
                  : 'Change Orders'}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
