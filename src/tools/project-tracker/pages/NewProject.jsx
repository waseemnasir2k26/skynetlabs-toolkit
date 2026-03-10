import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import {
  createEmptyProject, createPhase, createPaymentMilestone,
  projectTypes, defaultPhases, generateId, createTask
} from '../utils/helpers';

export default function NewProject() {
  const { addProject } = useProjects();
  const navigate = useNavigate();
  const [project, setProject] = useState(createEmptyProject());

  const updateField = (field, value) => {
    setProject(prev => ({ ...prev, [field]: value }));
  };

  const addPhase = () => {
    setProject(prev => ({
      ...prev,
      phases: [...prev.phases, createPhase()],
    }));
  };

  const addDefaultPhases = () => {
    setProject(prev => ({
      ...prev,
      phases: defaultPhases.map(p => createPhase(p.name, p.description)),
    }));
  };

  const updatePhase = (idx, field, value) => {
    setProject(prev => {
      const phases = [...prev.phases];
      phases[idx] = { ...phases[idx], [field]: value };
      return { ...prev, phases };
    });
  };

  const removePhase = (idx) => {
    setProject(prev => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== idx),
    }));
  };

  const movePhase = (idx, dir) => {
    setProject(prev => {
      const phases = [...prev.phases];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= phases.length) return prev;
      [phases[idx], phases[newIdx]] = [phases[newIdx], phases[idx]];
      return { ...prev, phases };
    });
  };

  const addTaskToPhase = (phaseIdx) => {
    setProject(prev => {
      const phases = [...prev.phases];
      phases[phaseIdx] = {
        ...phases[phaseIdx],
        tasks: [...phases[phaseIdx].tasks, createTask()],
      };
      return { ...prev, phases };
    });
  };

  const updateTask = (phaseIdx, taskIdx, field, value) => {
    setProject(prev => {
      const phases = [...prev.phases];
      const tasks = [...phases[phaseIdx].tasks];
      tasks[taskIdx] = { ...tasks[taskIdx], [field]: value };
      phases[phaseIdx] = { ...phases[phaseIdx], tasks };
      return { ...prev, phases };
    });
  };

  const removeTask = (phaseIdx, taskIdx) => {
    setProject(prev => {
      const phases = [...prev.phases];
      phases[phaseIdx] = {
        ...phases[phaseIdx],
        tasks: phases[phaseIdx].tasks.filter((_, i) => i !== taskIdx),
      };
      return { ...prev, phases };
    });
  };

  const addMilestone = () => {
    setProject(prev => ({
      ...prev,
      paymentMilestones: [...prev.paymentMilestones, createPaymentMilestone()],
    }));
  };

  const updateMilestone = (idx, field, value) => {
    setProject(prev => {
      const milestones = [...prev.paymentMilestones];
      milestones[idx] = { ...milestones[idx], [field]: value };
      return { ...prev, paymentMilestones: milestones };
    });
  };

  const removeMilestone = (idx) => {
    setProject(prev => ({
      ...prev,
      paymentMilestones: prev.paymentMilestones.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!project.name.trim()) return;
    addProject(project);
    navigate(`/project-tracker/project/${project.id}`);
  };

  const inputClass = "w-full px-3 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors";
  const labelClass = "block text-sm font-medium text-text-secondary mb-1.5";

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Project Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>Project Name *</label>
              <input type="text" value={project.name} onChange={e => updateField('name', e.target.value)} className={inputClass} placeholder="e.g., Company Website Redesign" required />
            </div>
            <div>
              <label className={labelClass}>Client Name</label>
              <input type="text" value={project.clientName} onChange={e => updateField('clientName', e.target.value)} className={inputClass} placeholder="Client or company name" />
            </div>
            <div>
              <label className={labelClass}>Client Email</label>
              <input type="email" value={project.clientEmail} onChange={e => updateField('clientEmail', e.target.value)} className={inputClass} placeholder="client@example.com" />
            </div>
            <div>
              <label className={labelClass}>Project Type</label>
              <select value={project.projectType} onChange={e => updateField('projectType', e.target.value)} className={inputClass}>
                {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Total Budget</label>
              <input type="text" value={project.budget} onChange={e => updateField('budget', e.target.value)} className={inputClass} placeholder="$0.00" />
            </div>
            <div>
              <label className={labelClass}>Start Date</label>
              <input type="date" value={project.startDate} onChange={e => updateField('startDate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estimated End Date</label>
              <input type="date" value={project.estimatedEndDate} onChange={e => updateField('estimatedEndDate', e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        {/* Phases */}
        <section className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Project Phases</h2>
            <div className="flex gap-2">
              {project.phases.length === 0 && (
                <button type="button" onClick={addDefaultPhases} className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-semibold hover:bg-primary/30 transition-colors">
                  Use Defaults
                </button>
              )}
              <button type="button" onClick={addPhase} className="px-3 py-1.5 bg-border text-text-secondary rounded-lg text-xs font-semibold hover:bg-border-light transition-colors">
                + Add Phase
              </button>
            </div>
          </div>

          {project.phases.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-8">No phases added yet. Add default phases or create custom ones.</p>
          ) : (
            <div className="space-y-4">
              {project.phases.map((phase, idx) => (
                <div key={phase.id} className="bg-bg-darkest border border-border rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="flex flex-col gap-0.5 pt-1">
                      <button type="button" onClick={() => movePhase(idx, -1)} disabled={idx === 0} className="text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                      </button>
                      <button type="button" onClick={() => movePhase(idx, 1)} disabled={idx === project.phases.length - 1} className="text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                      </button>
                    </div>
                    <div className="flex-1 grid gap-3 md:grid-cols-2">
                      <input type="text" value={phase.name} onChange={e => updatePhase(idx, 'name', e.target.value)} className={inputClass} placeholder="Phase name" />
                      <select value={phase.status} onChange={e => updatePhase(idx, 'status', e.target.value)} className={inputClass}>
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div className="md:col-span-2">
                        <textarea value={phase.description} onChange={e => updatePhase(idx, 'description', e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Phase description" />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted">Start Date</label>
                        <input type="date" value={phase.startDate} onChange={e => updatePhase(idx, 'startDate', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted">End Date</label>
                        <input type="date" value={phase.endDate} onChange={e => updatePhase(idx, 'endDate', e.target.value)} className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-text-muted">Progress: {phase.progress}%</label>
                        <input type="range" min="0" max="100" value={phase.progress} onChange={e => updatePhase(idx, 'progress', parseInt(e.target.value))} className="w-full mt-1" />
                      </div>
                      <div className="md:col-span-2">
                        <textarea value={phase.deliverables} onChange={e => updatePhase(idx, 'deliverables', e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Deliverables for this phase" />
                      </div>
                      {/* Tasks */}
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-text-muted font-medium">Tasks</label>
                          <button type="button" onClick={() => addTaskToPhase(idx)} className="text-xs text-primary hover:text-primary-light transition-colors">+ Add Task</button>
                        </div>
                        {phase.tasks.map((task, tIdx) => (
                          <div key={task.id} className="flex items-center gap-2 mb-1.5">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={e => updateTask(idx, tIdx, 'completed', e.target.checked)}
                              className="w-4 h-4 rounded border-border accent-primary"
                            />
                            <input
                              type="text"
                              value={task.text}
                              onChange={e => updateTask(idx, tIdx, 'text', e.target.value)}
                              className={`flex-1 ${inputClass} py-1.5`}
                              placeholder="Task description"
                            />
                            <button type="button" onClick={() => removeTask(idx, tIdx)} className="text-text-muted hover:text-status-red transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => removePhase(idx)} className="p-1 text-text-muted hover:text-status-red transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Payment Milestones */}
        <section className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Payment Milestones</h2>
            <button type="button" onClick={addMilestone} className="px-3 py-1.5 bg-border text-text-secondary rounded-lg text-xs font-semibold hover:bg-border-light transition-colors">
              + Add Milestone
            </button>
          </div>

          {project.paymentMilestones.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">No payment milestones added</p>
          ) : (
            <div className="space-y-3">
              {project.paymentMilestones.map((m, idx) => (
                <div key={m.id} className="flex items-center gap-3 bg-bg-darkest border border-border rounded-lg p-3">
                  <input type="text" value={m.name} onChange={e => updateMilestone(idx, 'name', e.target.value)} className={`flex-1 ${inputClass}`} placeholder="Milestone name" />
                  <input type="text" value={m.amount} onChange={e => updateMilestone(idx, 'amount', e.target.value)} className={`w-32 ${inputClass}`} placeholder="$0.00" />
                  <select value={m.status} onChange={e => updateMilestone(idx, 'status', e.target.value)} className={`w-32 ${inputClass}`}>
                    <option value="upcoming">Upcoming</option>
                    <option value="due">Due</option>
                    <option value="paid">Paid</option>
                  </select>
                  <button type="button" onClick={() => removeMilestone(idx)} className="p-1 text-text-muted hover:text-status-red transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/project-tracker')} className="px-6 py-2.5 bg-border text-text-secondary rounded-lg text-sm font-semibold hover:bg-border-light transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors">
            Create Project
          </button>
        </div>
      </form>
    </div>
  );
}
