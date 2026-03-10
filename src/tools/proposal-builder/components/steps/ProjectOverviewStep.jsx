import { v4 as uuidv4 } from 'uuid';
import { useProposal } from '../../context/ProposalContext';

const ProjectOverviewStep = () => {
  const { proposal, updateField, updateSection } = useProposal();
  const { project } = proposal;

  const addObjective = () => {
    updateField('project', 'objectives', [
      ...project.objectives,
      { id: uuidv4(), text: '' },
    ]);
  };

  const removeObjective = (id) => {
    if (project.objectives.length <= 1) return;
    updateField(
      'project',
      'objectives',
      project.objectives.filter((o) => o.id !== id)
    );
  };

  const updateObjective = (id, text) => {
    updateField(
      'project',
      'objectives',
      project.objectives.map((o) => (o.id === id ? { ...o, text } : o))
    );
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Project Overview</h2>
        <p className="text-dark-muted">Describe the project at a high level.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-muted mb-1.5">Project Title *</label>
        <input
          type="text"
          value={project.title}
          onChange={(e) => updateField('project', 'title', e.target.value)}
          placeholder="Website Redesign & Development"
          className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-muted mb-1.5">Project Summary</label>
        <textarea
          value={project.summary}
          onChange={(e) => updateField('project', 'summary', e.target.value)}
          placeholder="A brief overview of the project, its goals, and expected outcomes..."
          rows={4}
          className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-muted mb-3">Project Objectives</label>
        <div className="space-y-3">
          {project.objectives.map((obj, index) => (
            <div key={obj.id} className="flex items-center gap-2">
              <span className="text-primary font-bold text-sm min-w-[24px]">{index + 1}.</span>
              <input
                type="text"
                value={obj.text}
                onChange={(e) => updateObjective(obj.id, e.target.value)}
                placeholder="Enter an objective..."
                className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition"
              />
              <button
                onClick={() => removeObjective(obj.id)}
                disabled={project.objectives.length <= 1}
                className="p-2 text-dark-muted hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addObjective}
          className="mt-3 flex items-center gap-2 text-primary hover:text-primary-light text-sm font-medium transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Objective
        </button>
      </div>
    </div>
  );
};

export default ProjectOverviewStep;
