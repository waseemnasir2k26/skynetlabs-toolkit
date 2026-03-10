import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import {
  calculateOverallProgress, getCurrentPhase, getHealthStatus, formatDate, formatDateTime,
  statusColors, projectTypes, createPhase, createPaymentMilestone,
  createUpdate, createActionItem, createTask, duplicateProject, generateId
} from '../utils/helpers';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, updateProject, deleteProject, addProject } = useProjects();
  const project = getProject(id);
  const [activeTab, setActiveTab] = useState('overview');
  const [editModal, setEditModal] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [updateVisibility, setUpdateVisibility] = useState('client');
  const [updateAttachment, setUpdateAttachment] = useState('');
  const [actionItemText, setActionItemText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-text-secondary">Project not found</h2>
        <Link to="/project-tracker" className="text-primary mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress(project.phases);
  const currentPhase = getCurrentPhase(project.phases);
  const health = getHealthStatus(project);

  const update = (updates) => updateProject(id, updates);

  const handleAddUpdate = () => {
    if (!updateText.trim()) return;
    const attachments = updateAttachment.trim() ? [updateAttachment.trim()] : [];
    const newUpdate = createUpdate(updateText, updateVisibility, attachments);
    update({ updates: [newUpdate, ...(project.updates || [])] });
    setUpdateText('');
    setUpdateAttachment('');
  };

  const handleTogglePin = (updateId) => {
    const updates = (project.updates || []).map(u =>
      u.id === updateId ? { ...u, pinned: !u.pinned } : u
    );
    update({ updates });
  };

  const handleDeleteUpdate = (updateId) => {
    update({ updates: (project.updates || []).filter(u => u.id !== updateId) });
  };

  const handleAddActionItem = () => {
    if (!actionItemText.trim()) return;
    update({ actionItems: [...(project.actionItems || []), createActionItem(actionItemText)] });
    setActionItemText('');
  };

  const handleToggleActionItem = (itemId) => {
    const items = (project.actionItems || []).map(a =>
      a.id === itemId ? { ...a, completed: !a.completed } : a
    );
    update({ actionItems: items });
  };

  const handleDeleteActionItem = (itemId) => {
    update({ actionItems: (project.actionItems || []).filter(a => a.id !== itemId) });
  };

  const handleDuplicate = () => {
    const dup = duplicateProject(project);
    addProject(dup);
    navigate(`/project-tracker/project/${dup.id}`);
  };

  const handleDelete = () => {
    deleteProject(id);
    navigate('/project-tracker');
  };

  const clientShareUrl = `${window.location.origin}/project-tracker/client/${id}`;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'phases', label: 'Phases' },
    { key: 'updates', label: 'Updates' },
    { key: 'actions', label: 'Action Items' },
    { key: 'payments', label: 'Payments' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <Link to="/project-tracker" className="text-text-muted text-sm hover:text-text-secondary transition-colors mb-2 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
            <span>{project.clientName}</span>
            <span className="text-text-muted">|</span>
            <span>{project.projectType}</span>
            <span className="text-text-muted">|</span>
            <StatusBadge status={health} type="health" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { navigator.clipboard.writeText(clientShareUrl); }}
            className="px-3 py-2 bg-bg-card border border-border rounded-lg text-xs font-semibold text-text-secondary hover:text-primary hover:border-primary transition-colors"
          >
            Copy Client Link
          </button>
          <Link
            to={`/project-tracker/client/${id}`}
            target="_blank"
            className="px-3 py-2 bg-primary/20 text-primary rounded-lg text-xs font-semibold hover:bg-primary/30 transition-colors"
          >
            Preview Client View
          </Link>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text-secondary">Overall Progress</span>
          <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
        </div>
        <ProgressBar value={overallProgress} size="lg" showLabel={false} />
        <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
          <span>Started: {formatDate(project.startDate)}</span>
          {currentPhase && <span>Current: {currentPhase.name}</span>}
          <span>Due: {formatDate(project.estimatedEndDate) || 'TBD'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab project={project} />}
      {activeTab === 'phases' && <PhasesTab project={project} update={update} />}
      {activeTab === 'updates' && (
        <UpdatesTab
          project={project}
          updateText={updateText}
          setUpdateText={setUpdateText}
          updateVisibility={updateVisibility}
          setUpdateVisibility={setUpdateVisibility}
          updateAttachment={updateAttachment}
          setUpdateAttachment={setUpdateAttachment}
          onAdd={handleAddUpdate}
          onTogglePin={handleTogglePin}
          onDelete={handleDeleteUpdate}
        />
      )}
      {activeTab === 'actions' && (
        <ActionsTab
          project={project}
          actionItemText={actionItemText}
          setActionItemText={setActionItemText}
          onAdd={handleAddActionItem}
          onToggle={handleToggleActionItem}
          onDelete={handleDeleteActionItem}
        />
      )}
      {activeTab === 'payments' && <PaymentsTab project={project} update={update} />}
      {activeTab === 'settings' && (
        <SettingsTab
          project={project}
          update={update}
          onDuplicate={handleDuplicate}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      )}

      {/* Delete Confirm Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Project">
        <p className="text-text-secondary mb-6">Are you sure you want to delete "{project.name}"? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-border text-text-secondary rounded-lg text-sm font-semibold">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-status-red text-white rounded-lg text-sm font-semibold">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function OverviewTab({ project }) {
  const pinnedUpdates = (project.updates || []).filter(u => u.pinned);
  const recentUpdates = (project.updates || []).filter(u => u.visibility === 'client').slice(0, 5);
  const pendingActions = (project.actionItems || []).filter(a => !a.completed);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Timeline */}
      <div className="bg-bg-card border border-border rounded-xl p-6 lg:col-span-2">
        <h3 className="font-semibold mb-4">Project Timeline</h3>
        <div className="relative">
          {(project.phases || []).length === 0 ? (
            <p className="text-text-muted text-sm">No phases defined</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {project.phases.map((phase, idx) => {
                const sc = statusColors[phase.status] || statusColors['not-started'];
                return (
                  <div key={phase.id} className="flex-1 min-w-[140px]">
                    <div className={`relative p-3 rounded-lg border ${
                      phase.status === 'in-progress' ? 'border-primary bg-primary/10' : 'border-border bg-bg-darkest'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          phase.status === 'completed' ? 'bg-status-blue text-white' :
                          phase.status === 'in-progress' ? 'bg-primary text-white' :
                          'bg-border text-text-muted'
                        }`}>
                          {phase.status === 'completed' ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          ) : idx + 1}
                        </span>
                        <span className="text-xs font-semibold truncate">{phase.name}</span>
                      </div>
                      <ProgressBar value={phase.progress} size="sm" />
                      <div className="mt-2">
                        <StatusBadge status={phase.status} type="status" />
                      </div>
                    </div>
                    {idx < project.phases.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-1 w-2 h-0.5 bg-border" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="bg-status-amber/5 border border-status-amber/30 rounded-xl p-6">
          <h3 className="font-semibold text-status-amber mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            Action Required ({pendingActions.length})
          </h3>
          <div className="space-y-2">
            {pendingActions.map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm text-text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-status-amber flex-shrink-0" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Updates */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-3">Recent Updates</h3>
        {recentUpdates.length === 0 ? (
          <p className="text-text-muted text-sm">No updates yet</p>
        ) : (
          <div className="space-y-3">
            {recentUpdates.map(u => (
              <div key={u.id} className="border-l-2 border-border pl-3">
                <p className="text-sm text-text-primary">{u.text}</p>
                <p className="text-xs text-text-muted mt-1">{formatDateTime(u.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-3">Payment Summary</h3>
        {(project.paymentMilestones || []).length === 0 ? (
          <p className="text-text-muted text-sm">No payment milestones</p>
        ) : (
          <div className="space-y-2">
            {project.paymentMilestones.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">{m.name || 'Unnamed'}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{m.amount}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.status === 'paid' ? 'bg-status-green/20 text-status-green' :
                    m.status === 'due' ? 'bg-status-amber/20 text-status-amber' :
                    'bg-border text-text-muted'
                  }`}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PhasesTab({ project, update }) {
  const addPhase = () => {
    update({ phases: [...(project.phases || []), createPhase()] });
  };

  const updatePhase = (idx, field, value) => {
    const phases = [...(project.phases || [])];
    phases[idx] = { ...phases[idx], [field]: value };
    update({ phases });
  };

  const removePhase = (idx) => {
    update({ phases: (project.phases || []).filter((_, i) => i !== idx) });
  };

  const movePhase = (idx, dir) => {
    const phases = [...(project.phases || [])];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= phases.length) return;
    [phases[idx], phases[newIdx]] = [phases[newIdx], phases[idx]];
    update({ phases });
  };

  const addTaskToPhase = (phaseIdx) => {
    const phases = [...(project.phases || [])];
    phases[phaseIdx] = {
      ...phases[phaseIdx],
      tasks: [...phases[phaseIdx].tasks, createTask()],
    };
    update({ phases });
  };

  const updateTask = (phaseIdx, taskIdx, field, value) => {
    const phases = [...(project.phases || [])];
    const tasks = [...phases[phaseIdx].tasks];
    tasks[taskIdx] = { ...tasks[taskIdx], [field]: value };
    phases[phaseIdx] = { ...phases[phaseIdx], tasks };
    update({ phases });
  };

  const removeTask = (phaseIdx, taskIdx) => {
    const phases = [...(project.phases || [])];
    phases[phaseIdx] = {
      ...phases[phaseIdx],
      tasks: phases[phaseIdx].tasks.filter((_, i) => i !== taskIdx),
    };
    update({ phases });
  };

  const inputClass = "w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={addPhase} className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
          + Add Phase
        </button>
      </div>

      {(project.phases || []).map((phase, idx) => (
        <div key={phase.id} className="bg-bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-0.5 pt-1">
              <button onClick={() => movePhase(idx, -1)} disabled={idx === 0} className="text-text-muted hover:text-text-primary disabled:opacity-30"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg></button>
              <button onClick={() => movePhase(idx, 1)} disabled={idx === project.phases.length - 1} className="text-text-muted hover:text-text-primary disabled:opacity-30"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></button>
            </div>
            <div className="flex-1 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <input type="text" value={phase.name} onChange={e => updatePhase(idx, 'name', e.target.value)} className={inputClass} placeholder="Phase name" />
                <select value={phase.status} onChange={e => updatePhase(idx, 'status', e.target.value)} className={inputClass}>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <textarea value={phase.description} onChange={e => updatePhase(idx, 'description', e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Description" />
              <div className="grid gap-3 md:grid-cols-2">
                <div><label className="text-xs text-text-muted">Start</label><input type="date" value={phase.startDate} onChange={e => updatePhase(idx, 'startDate', e.target.value)} className={inputClass} /></div>
                <div><label className="text-xs text-text-muted">End</label><input type="date" value={phase.endDate} onChange={e => updatePhase(idx, 'endDate', e.target.value)} className={inputClass} /></div>
              </div>
              <div>
                <label className="text-xs text-text-muted">Progress: {phase.progress}%</label>
                <input type="range" min="0" max="100" value={phase.progress} onChange={e => updatePhase(idx, 'progress', parseInt(e.target.value))} />
              </div>
              <textarea value={phase.deliverables} onChange={e => updatePhase(idx, 'deliverables', e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Deliverables" />

              {/* Tasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-text-muted font-medium">Tasks</label>
                  <button onClick={() => addTaskToPhase(idx)} className="text-xs text-primary hover:text-primary-light">+ Add Task</button>
                </div>
                {phase.tasks.map((task, tIdx) => (
                  <div key={task.id} className="flex items-center gap-2 mb-1.5">
                    <input type="checkbox" checked={task.completed} onChange={e => updateTask(idx, tIdx, 'completed', e.target.checked)} className="w-4 h-4 accent-primary" />
                    <input type="text" value={task.text} onChange={e => updateTask(idx, tIdx, 'text', e.target.value)} className={`flex-1 ${inputClass} py-1.5`} placeholder="Task" />
                    <button onClick={() => removeTask(idx, tIdx)} className="text-text-muted hover:text-status-red"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => removePhase(idx)} className="p-1 text-text-muted hover:text-status-red"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UpdatesTab({ project, updateText, setUpdateText, updateVisibility, setUpdateVisibility, updateAttachment, setUpdateAttachment, onAdd, onTogglePin, onDelete }) {
  const inputClass = "w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors";
  const updates = project.updates || [];
  const pinned = updates.filter(u => u.pinned);
  const unpinned = updates.filter(u => !u.pinned);

  return (
    <div className="space-y-6">
      {/* New update form */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold mb-3">Add Update</h3>
        <textarea value={updateText} onChange={e => setUpdateText(e.target.value)} className={`${inputClass} resize-none mb-3`} rows={3} placeholder="Write an update..." />
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <input type="url" value={updateAttachment} onChange={e => setUpdateAttachment(e.target.value)} className={inputClass} placeholder="Attachment URL (optional)" />
          </div>
          <select value={updateVisibility} onChange={e => setUpdateVisibility(e.target.value)} className={`${inputClass} w-40`}>
            <option value="client">Client Visible</option>
            <option value="internal">Internal Only</option>
          </select>
          <button onClick={onAdd} disabled={!updateText.trim()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-colors">
            Post Update
          </button>
        </div>
      </div>

      {/* Pinned */}
      {pinned.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Pinned</h3>
          <div className="space-y-3">
            {pinned.map(u => (
              <UpdateCard key={u.id} update={u} onTogglePin={onTogglePin} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {/* All updates */}
      <div className="space-y-3">
        {unpinned.map(u => (
          <UpdateCard key={u.id} update={u} onTogglePin={onTogglePin} onDelete={onDelete} />
        ))}
      </div>
      {updates.length === 0 && <p className="text-text-muted text-center py-8">No updates yet</p>}
    </div>
  );
}

function UpdateCard({ update, onTogglePin, onDelete }) {
  return (
    <div className={`bg-bg-card border rounded-xl p-4 ${update.pinned ? 'border-primary/30' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-text-primary whitespace-pre-wrap">{update.text}</p>
          {update.attachments && update.attachments.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {update.attachments.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.12a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.81" /></svg>
                  Attachment
                </a>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-text-muted">{formatDateTime(update.createdAt)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${update.visibility === 'internal' ? 'bg-status-amber/20 text-status-amber' : 'bg-primary/20 text-primary'}`}>
              {update.visibility === 'internal' ? 'Internal' : 'Client Visible'}
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onTogglePin(update.id)} className={`p-1 transition-colors ${update.pinned ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`} title={update.pinned ? 'Unpin' : 'Pin'}>
            <svg className="w-4 h-4" fill={update.pinned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75h9z" />
            </svg>
          </button>
          <button onClick={() => onDelete(update.id)} className="p-1 text-text-muted hover:text-status-red transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionsTab({ project, actionItemText, setActionItemText, onAdd, onToggle, onDelete }) {
  const inputClass = "w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors";
  const pending = (project.actionItems || []).filter(a => !a.completed);
  const completed = (project.actionItems || []).filter(a => a.completed);

  return (
    <div className="space-y-6">
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold mb-3">Add Action Item (Client Task)</h3>
        <div className="flex gap-3">
          <input type="text" value={actionItemText} onChange={e => setActionItemText(e.target.value)} className={`flex-1 ${inputClass}`} placeholder="What does the client need to do?" onKeyDown={e => e.key === 'Enter' && onAdd()} />
          <button onClick={onAdd} disabled={!actionItemText.trim()} className="px-4 py-2 bg-status-amber text-white rounded-lg text-sm font-semibold hover:bg-status-amber/80 disabled:opacity-50 transition-colors">
            Add
          </button>
        </div>
      </div>

      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-status-amber mb-3">Needs Client Action ({pending.length})</h3>
          <div className="space-y-2">
            {pending.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-status-amber/5 border border-status-amber/20 rounded-lg p-3">
                <input type="checkbox" checked={false} onChange={() => onToggle(item.id)} className="w-4 h-4 accent-primary" />
                <span className="flex-1 text-sm">{item.text}</span>
                <span className="text-xs text-text-muted">{formatDateTime(item.createdAt)}</span>
                <button onClick={() => onDelete(item.id)} className="text-text-muted hover:text-status-red"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-muted mb-3">Completed ({completed.length})</h3>
          <div className="space-y-2">
            {completed.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-bg-card border border-border rounded-lg p-3 opacity-60">
                <input type="checkbox" checked={true} onChange={() => onToggle(item.id)} className="w-4 h-4 accent-primary" />
                <span className="flex-1 text-sm line-through">{item.text}</span>
                <button onClick={() => onDelete(item.id)} className="text-text-muted hover:text-status-red"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {(project.actionItems || []).length === 0 && <p className="text-text-muted text-center py-8">No action items</p>}
    </div>
  );
}

function PaymentsTab({ project, update }) {
  const addMilestone = () => {
    update({ paymentMilestones: [...(project.paymentMilestones || []), createPaymentMilestone()] });
  };

  const updateMilestone = (idx, field, value) => {
    const milestones = [...(project.paymentMilestones || [])];
    milestones[idx] = { ...milestones[idx], [field]: value };
    update({ paymentMilestones: milestones });
  };

  const removeMilestone = (idx) => {
    update({ paymentMilestones: (project.paymentMilestones || []).filter((_, i) => i !== idx) });
  };

  const inputClass = "w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors";

  const paid = (project.paymentMilestones || []).filter(m => m.status === 'paid');
  const totalPaid = paid.reduce((s, m) => s + (parseFloat(m.amount?.replace(/[^0-9.]/g, '')) || 0), 0);
  const totalAll = (project.paymentMilestones || []).reduce((s, m) => s + (parseFloat(m.amount?.replace(/[^0-9.]/g, '')) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider">Total Budget</p>
          <p className="text-xl font-bold mt-1">{project.budget || '$0'}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider">Paid</p>
          <p className="text-xl font-bold mt-1 text-status-green">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider">Remaining</p>
          <p className="text-xl font-bold mt-1 text-status-amber">${(totalAll - totalPaid).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={addMilestone} className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
          + Add Milestone
        </button>
      </div>

      {(project.paymentMilestones || []).map((m, idx) => (
        <div key={m.id} className="flex flex-wrap items-center gap-3 bg-bg-card border border-border rounded-xl p-4">
          <input type="text" value={m.name} onChange={e => updateMilestone(idx, 'name', e.target.value)} className={`flex-1 min-w-[150px] ${inputClass}`} placeholder="Milestone name" />
          <input type="text" value={m.amount} onChange={e => updateMilestone(idx, 'amount', e.target.value)} className={`w-32 ${inputClass}`} placeholder="$0.00" />
          <select value={m.status} onChange={e => updateMilestone(idx, 'status', e.target.value)} className={`w-32 ${inputClass}`}>
            <option value="upcoming">Upcoming</option>
            <option value="due">Due</option>
            <option value="paid">Paid</option>
          </select>
          <span className={`text-xs px-2 py-1 rounded-full ${
            m.status === 'paid' ? 'bg-status-green/20 text-status-green' :
            m.status === 'due' ? 'bg-status-amber/20 text-status-amber' :
            'bg-border text-text-muted'
          }`}>
            {m.status === 'paid' ? 'Paid' : m.status === 'due' ? 'Due Now' : 'Upcoming'}
          </span>
          <button onClick={() => removeMilestone(idx)} className="p-1 text-text-muted hover:text-status-red"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
      ))}
      {(project.paymentMilestones || []).length === 0 && <p className="text-text-muted text-center py-8">No payment milestones</p>}
    </div>
  );
}

function SettingsTab({ project, update, onDuplicate, onDelete }) {
  const inputClass = "w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Project Info</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs text-text-muted">Project Name</label>
            <input type="text" value={project.name} onChange={e => update({ name: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-text-muted">Client Name</label>
            <input type="text" value={project.clientName} onChange={e => update({ clientName: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-text-muted">Client Email</label>
            <input type="email" value={project.clientEmail} onChange={e => update({ clientEmail: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-text-muted">Project Type</label>
            <select value={project.projectType} onChange={e => update({ projectType: e.target.value })} className={inputClass}>
              {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted">Budget</label>
            <input type="text" value={project.budget} onChange={e => update({ budget: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-text-muted">Start Date</label>
            <input type="date" value={project.startDate} onChange={e => update({ startDate: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-text-muted">End Date</label>
            <input type="date" value={project.estimatedEndDate} onChange={e => update({ estimatedEndDate: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-text-muted">Status</label>
            <select value={project.status} onChange={e => update({ status: e.target.value })} className={inputClass}>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={onDuplicate} className="px-4 py-2 bg-border text-text-secondary rounded-lg text-sm font-semibold hover:bg-border-light transition-colors">
            Duplicate as Template
          </button>
          <button onClick={onDelete} className="px-4 py-2 bg-status-red/20 text-status-red rounded-lg text-sm font-semibold hover:bg-status-red/30 transition-colors">
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}
