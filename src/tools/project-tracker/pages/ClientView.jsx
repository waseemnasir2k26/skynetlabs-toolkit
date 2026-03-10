import { useParams } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { calculateOverallProgress, getCurrentPhase, formatDate, formatDateTime, statusColors } from '../utils/helpers';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';

export default function ClientView() {
  const { id } = useParams();
  const { getProject } = useProjects();
  const project = getProject(id);

  if (!project) {
    return (
      <div className="min-h-screen bg-bg-darkest flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-secondary">Project not found</h2>
          <p className="text-text-muted mt-2">This link may be invalid or the project may have been removed.</p>
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress(project.phases);
  const currentPhase = getCurrentPhase(project.phases);
  const clientUpdates = (project.updates || []).filter(u => u.visibility === 'client');
  const pendingActions = (project.actionItems || []).filter(a => !a.completed);
  const completedActions = (project.actionItems || []).filter(a => a.completed);

  return (
    <div className="min-h-screen bg-bg-darkest">
      {/* Header */}
      <header className="border-b border-border bg-bg-dark">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-8">
          <div className="flex items-center justify-between mb-4">
            <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer">
              <h1 className="text-lg font-bold tracking-widest text-primary">SKYNET LABS</h1>
              <p className="text-xs text-text-muted tracking-wider">AI Automation Agency</p>
            </a>
            <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full font-semibold">
              Client Portal
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary">
              <span>{project.projectType}</span>
              <span className="text-text-muted">|</span>
              <span>{formatDate(project.startDate)} - {formatDate(project.estimatedEndDate) || 'TBD'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Overall Progress */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-secondary">Overall Progress</span>
            <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
          </div>
          <ProgressBar value={overallProgress} size="lg" showLabel={false} />
          {currentPhase && (
            <p className="text-sm text-text-muted mt-3">Currently in: <span className="text-primary font-medium">{currentPhase.name}</span></p>
          )}
        </div>

        {/* Action Required */}
        {pendingActions.length > 0 && (
          <div className="bg-status-amber/5 border-2 border-status-amber/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-status-amber mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              Action Required - Items Pending From You
            </h3>
            <div className="space-y-3">
              {pendingActions.map(item => (
                <div key={item.id} className="flex items-start gap-3 p-3 bg-bg-darkest/50 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-status-amber mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-text-primary font-medium">{item.text}</p>
                    <p className="text-xs text-text-muted mt-0.5">Added {formatDateTime(item.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phase Timeline */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-6">Project Roadmap</h3>
          {(project.phases || []).length === 0 ? (
            <p className="text-text-muted">Project phases have not been defined yet.</p>
          ) : (
            <div className="space-y-4">
              {project.phases.map((phase, idx) => {
                const isActive = phase.status === 'in-progress';
                return (
                  <div key={phase.id} className={`relative border rounded-xl p-5 transition-all ${
                    isActive ? 'border-primary bg-primary/5' : 'border-border'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        phase.status === 'completed' ? 'bg-status-blue text-white' :
                        isActive ? 'bg-primary text-white' :
                        'bg-border text-text-muted'
                      }`}>
                        {phase.status === 'completed' ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        ) : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold">{phase.name}</h4>
                          <StatusBadge status={phase.status} type="status" />
                          {isActive && <span className="text-xs text-primary font-semibold animate-pulse">CURRENT</span>}
                        </div>
                        {phase.description && <p className="text-sm text-text-secondary mb-3">{phase.description}</p>}
                        <ProgressBar value={phase.progress} size="sm" className="mb-2" />
                        {(phase.startDate || phase.endDate) && (
                          <p className="text-xs text-text-muted">{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</p>
                        )}
                        {phase.deliverables && (
                          <div className="mt-3 p-3 bg-bg-darkest rounded-lg">
                            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Deliverables</p>
                            <p className="text-sm text-text-secondary whitespace-pre-wrap">{phase.deliverables}</p>
                          </div>
                        )}
                        {phase.tasks && phase.tasks.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">Tasks</p>
                            {phase.tasks.map(task => (
                              <div key={task.id} className="flex items-center gap-2 text-sm mb-1">
                                <span className={`w-4 h-4 rounded flex items-center justify-center text-xs border ${
                                  task.completed ? 'bg-primary border-primary text-white' : 'border-border'
                                }`}>
                                  {task.completed && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                                </span>
                                <span className={task.completed ? 'text-text-muted line-through' : 'text-text-primary'}>{task.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Updates */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Updates</h3>
          {clientUpdates.length === 0 ? (
            <p className="text-text-muted">No updates to show yet.</p>
          ) : (
            <div className="space-y-4">
              {clientUpdates.map(u => (
                <div key={u.id} className={`border-l-2 pl-4 py-1 ${u.pinned ? 'border-primary' : 'border-border'}`}>
                  {u.pinned && <span className="text-xs text-primary font-semibold">PINNED</span>}
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{u.text}</p>
                  {u.attachments && u.attachments.length > 0 && (
                    <div className="flex gap-2 mt-1">
                      {u.attachments.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          View Attachment
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-text-muted mt-1">{formatDateTime(u.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Milestones */}
        {(project.paymentMilestones || []).length > 0 && (
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Milestones</h3>
            <div className="space-y-3">
              {project.paymentMilestones.map((m, idx) => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-bg-darkest rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      m.status === 'paid' ? 'bg-status-green/20 text-status-green' :
                      m.status === 'due' ? 'bg-status-amber/20 text-status-amber' :
                      'bg-border text-text-muted'
                    }`}>
                      {m.status === 'paid' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      ) : idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{m.name || 'Payment Milestone'}</p>
                      <p className="text-xs text-text-muted capitalize">{m.status}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{m.amount || '$0'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Actions */}
        {completedActions.length > 0 && (
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-text-muted mb-3">Completed Items</h3>
            <div className="space-y-2">
              {completedActions.map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm text-text-muted">
                  <svg className="w-4 h-4 text-status-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  <span className="line-through">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="inline-block">
            <p className="text-sm font-bold tracking-widest text-primary">SKYNET LABS</p>
            <p className="text-xs text-text-muted mt-0.5">AI Automation Agency</p>
          </a>
          <p className="text-xs text-text-muted mt-2">
            <a href="https://www.skynetjoe.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">www.skynetjoe.com</a>
          </p>
        </div>
      </main>
    </div>
  );
}
