import React, { useState } from 'react';
import {
  formatCurrency,
  formatDate,
  calcProjectStats,
  getCreepColor,
} from '../utils/helpers';

export default function ProjectList({
  projects,
  onSelect,
  onNewProject,
  onDelete,
  onArchive,
}) {
  const [showArchived, setShowArchived] = useState(false);

  const activeProjects = projects.filter((p) => !p.archived);
  const archivedProjects = projects.filter((p) => p.archived);
  const displayProjects = showArchived ? archivedProjects : activeProjects;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-100">Scope Creep Tracker</h1>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Track scope changes, see the financial impact, and generate professional
          change orders for your freelance projects.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              !showArchived
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Active ({activeProjects.length})
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              showArchived
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Archived ({archivedProjects.length})
          </button>
        </div>
        <button onClick={onNewProject} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {/* Project cards */}
      {displayProjects.length === 0 ? (
        <div className="card text-center py-16">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-400 text-lg mb-2">
            {showArchived ? 'No archived projects' : 'No projects yet'}
          </p>
          {!showArchived && (
            <p className="text-gray-500 text-sm">
              Create your first project to start tracking scope changes.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {displayProjects.map((project) => {
            const stats = calcProjectStats(project);
            const color = getCreepColor(stats.creepPercentage);

            return (
              <div
                key={project.id}
                className="card card-hover cursor-pointer"
                onClick={() => onSelect(project.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-100 truncate">
                        {project.projectName}
                      </h3>
                      {project.archived && (
                        <span className="badge bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {project.clientName}
                      {project.deadline && <> &middot; Due {formatDate(project.deadline)}</>}
                    </p>

                    <div className="flex items-center gap-6 mt-3">
                      <div className="text-sm">
                        <span className="text-gray-500">Contract: </span>
                        <span className="font-medium text-gray-200">
                          {formatCurrency(
                            parseFloat(project.contractValue) || stats.originalValue
                          )}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Additional: </span>
                        <span className="font-medium" style={{ color }}>
                          +{formatCurrency(stats.additionalCost)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Requests: </span>
                        <span className="font-medium text-gray-200">
                          {stats.totalRequests}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="text-2xl font-bold"
                      style={{ color }}
                    >
                      {stats.creepPercentage.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">creep</div>
                    {/* Mini bar */}
                    <div className="w-16 bg-dark-600 rounded-full h-1.5 mt-2">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, stats.creepPercentage)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dark-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive(project.id);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {project.archived ? 'Unarchive' : 'Archive'}
                  </button>
                  <span className="text-dark-400">|</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this project? This cannot be undone.')) {
                        onDelete(project.id);
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-12 pb-8">
        <div className="text-xs tracking-[0.2em] font-bold text-primary mb-0.5">
          SKYNET LABS
        </div>
        <div className="text-[10px] tracking-wider text-gray-600">
          AI AUTOMATION AGENCY
        </div>
        <a
          href="https://www.skynetjoe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs text-gray-500 hover:text-primary transition-colors"
        >
          www.skynetjoe.com
        </a>
      </div>
    </div>
  );
}
