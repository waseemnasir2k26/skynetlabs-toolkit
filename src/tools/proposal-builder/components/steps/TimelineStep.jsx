import { v4 as uuidv4 } from 'uuid';
import { useProposal } from '../../context/ProposalContext';

const TimelineStep = () => {
  const { proposal, updateField } = useProposal();
  const { phases } = proposal.timeline;

  const addPhase = () => {
    updateField('timeline', 'phases', [
      ...phases,
      { id: uuidv4(), name: '', startDate: '', endDate: '', milestone: '' },
    ]);
  };

  const removePhase = (id) => {
    if (phases.length <= 1) return;
    updateField('timeline', 'phases', phases.filter((p) => p.id !== id));
  };

  const updatePhase = (id, field, value) => {
    updateField(
      'timeline',
      'phases',
      phases.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Timeline</h2>
        <p className="text-dark-muted">Break the project into phases with dates and milestones.</p>
      </div>

      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className="bg-dark-surface border border-dark-border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-primary font-semibold text-sm">Phase {index + 1}</span>
              <button
                onClick={() => removePhase(phase.id)}
                disabled={phases.length <= 1}
                className="p-1 text-dark-muted hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <input
              type="text"
              value={phase.name}
              onChange={(e) => updatePhase(phase.id, 'name', e.target.value)}
              placeholder="Phase name (e.g., Discovery & Research)"
              className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition text-sm"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-dark-muted mb-1">Start Date</label>
                <input
                  type="date"
                  value={phase.startDate}
                  onChange={(e) => updatePhase(phase.id, 'startDate', e.target.value)}
                  className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition text-sm [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-muted mb-1">End Date</label>
                <input
                  type="date"
                  value={phase.endDate}
                  onChange={(e) => updatePhase(phase.id, 'endDate', e.target.value)}
                  className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition text-sm [color-scheme:dark]"
                />
              </div>
            </div>

            <input
              type="text"
              value={phase.milestone}
              onChange={(e) => updatePhase(phase.id, 'milestone', e.target.value)}
              placeholder="Milestone / Key deliverable for this phase"
              className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition text-sm"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addPhase}
        className="flex items-center gap-2 text-primary hover:text-primary-light text-sm font-medium transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Phase
      </button>
    </div>
  );
};

export default TimelineStep;
