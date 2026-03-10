import React from 'react';

export default function Header({ currentView, onNavigate, hasActiveProject }) {
  return (
    <div className="bg-dark-100/50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('projects')} className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">
              Scope Creep Tracker
            </button>
          </div>

          {hasActiveProject && (
            <nav className="flex items-center gap-1">
              {['dashboard', 'analytics', 'change-orders'].map((view) => (
                <button
                  key={view}
                  onClick={() => onNavigate(view)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentView === view
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-200'
                  }`}
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
    </div>
  );
}
