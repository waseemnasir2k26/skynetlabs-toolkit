import React, { useState } from 'react';
import ScopeGauge from './ScopeGauge';
import ChangeRequestModal from './ChangeRequestModal';
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  daysBetween,
  addDays,
  calcProjectStats,
  getPriorityColor,
  getStatusColor,
  getCreepColor,
} from '../utils/helpers';

export default function Dashboard({ project, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const stats = calcProjectStats(project);

  const handleSaveRequest = (request) => {
    let changeRequests;
    if (editingRequest) {
      changeRequests = project.changeRequests.map((r) =>
        r.id === request.id ? request : r
      );
    } else {
      changeRequests = [...project.changeRequests, request];
    }
    onUpdate({ ...project, changeRequests });
    setShowModal(false);
    setEditingRequest(null);
  };

  const handleDeleteRequest = (id) => {
    onUpdate({
      ...project,
      changeRequests: project.changeRequests.filter((r) => r.id !== id),
    });
  };

  const handleDeliverableStatus = (id, status) => {
    onUpdate({
      ...project,
      deliverables: project.deliverables.map((d) =>
        d.id === id ? { ...d, status } : d
      ),
    });
  };

  const projectedDeadline =
    project.deadline && stats.timelineImpact > 0
      ? addDays(project.deadline, stats.timelineImpact)
      : project.deadline;

  const totalDays =
    project.startDate && project.deadline
      ? daysBetween(project.startDate, project.deadline)
      : 0;
  const elapsed =
    project.startDate
      ? Math.max(0, daysBetween(project.startDate, new Date().toISOString().split('T')[0]))
      : 0;
  const timelineProgress = totalDays > 0 ? Math.min(100, (elapsed / totalDays) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Project header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>{project.projectName}</h1>
          <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Client: <span style={{ color: 'var(--text-body)' }}>{project.clientName}</span>
            {project.startDate && (
              <>
                {' '}
                &middot; {formatDate(project.startDate)} - {formatDate(project.deadline)}
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRequest(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log New Request
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Original Value</span>
          <span className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>{formatCurrency(stats.originalValue)}</span>
        </div>
        <div className="stat-card">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Current Value</span>
          <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{formatCurrency(stats.currentValue)}</span>
        </div>
        <div className="stat-card">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Additional Cost</span>
          <span className="text-xl font-bold" style={{ color: getCreepColor(stats.creepPercentage) }}>
            +{formatCurrency(stats.additionalCost)}
          </span>
        </div>
        <div className="stat-card">
          <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Change Requests</span>
          <span className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
            {stats.totalRequests}
            {stats.pendingRequests > 0 && (
              <span className="text-sm font-normal ml-2" style={{ color: 'var(--warning)' }}>
                ({stats.pendingRequests} pending)
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge + timeline */}
        <div className="card flex flex-col items-center gap-6">
          <ScopeGauge percentage={stats.creepPercentage} />
          {stats.creepPercentage > 20 && (
            <div className="w-full rounded-lg p-3 flex items-center gap-2" style={{ background: 'var(--danger-soft)', border: '1px solid var(--danger)' }}>
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--danger)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
                Danger Zone: Scope creep exceeds 20%
              </span>
            </div>
          )}

          {/* Timeline bar */}
          {project.startDate && project.deadline && (
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{formatDateShort(project.startDate)}</span>
                <span>{formatDateShort(project.deadline)}</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${timelineProgress}%`, background: 'var(--accent)' }}
                />
              </div>
              {stats.timelineImpact > 0 && (
                <div className="text-xs text-center" style={{ color: 'var(--warning)' }}>
                  +{stats.timelineImpact} days &rarr; New deadline:{' '}
                  {formatDate(projectedDeadline)}
                </div>
              )}
            </div>
          )}

          <div className="w-full grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg p-3" style={{ background: 'var(--bg-elevated)' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>+{stats.additionalHours}h</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Extra Hours</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--bg-elevated)' }}>
              <div className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>+{stats.timelineImpact}d</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Days Added</div>
            </div>
          </div>
        </div>

        {/* Original scope */}
        <div className="card lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-body)' }}>Original Scope</h2>
          <div className="space-y-2">
            {project.deliverables.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--text-body)' }}>{d.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {d.hours}h @ {formatCurrency(d.rate)}/hr ={' '}
                    {formatCurrency((parseFloat(d.hours) || 0) * (parseFloat(d.rate) || 0))}
                  </div>
                </div>
                <select
                  value={d.status || 'Not Started'}
                  onChange={(e) => handleDeliverableStatus(d.id, e.target.value)}
                  className="!bg-transparent !border-0 !p-0 !pr-6 text-xs font-medium !ring-0"
                  style={{ color: getStatusColor(d.status || 'Not Started').color }}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Change requests list */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-body)' }}>Change Requests</h2>
        {project.changeRequests.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No change requests yet.</p>
            <p className="text-sm mt-1">Click "Log New Request" to track scope changes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.changeRequests.map((r) => (
              <div
                key={r.id}
                className="rounded-lg p-4 animate-fade-in transition-colors"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                        {r.description}
                      </span>
                      <span className="badge border" style={getPriorityColor(r.priority)}>
                        {r.priority}
                      </span>
                      <span className="badge border" style={getStatusColor(r.status)}>
                        {r.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>{r.category}</span>
                      <span>{formatDate(r.dateRequested)}</span>
                      <span>+{r.hours}h</span>
                      <span>+{r.timelineImpact || 0}d</span>
                      <span className="font-medium" style={{ color: 'var(--accent)' }}>
                        {formatCurrency((parseFloat(r.hours) || 0) * stats.rate)}
                      </span>
                    </div>
                    {r.clientQuote && (
                      <div className="mt-2 text-xs italic border-l-2 pl-3" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                        "{r.clientQuote}"
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingRequest(r);
                        setShowModal(true);
                      }}
                      className="p-1.5 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(r.id)}
                      className="p-1.5 transition-colors hover:opacity-80"
                      style={{ color: 'var(--text-muted)' }}
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ChangeRequestModal
          onSave={handleSaveRequest}
          onClose={() => {
            setShowModal(false);
            setEditingRequest(null);
          }}
          editRequest={editingRequest}
        />
      )}
    </div>
  );
}
