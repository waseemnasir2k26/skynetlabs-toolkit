import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useProposal } from '../../context/ProposalContext';

const DeliverablesStep = () => {
  const { proposal, updateSection } = useProposal();
  const deliverables = proposal.deliverables;
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const dragRef = useRef(null);

  const addDeliverable = () => {
    updateSection('deliverables', [
      ...deliverables,
      { id: uuidv4(), title: '', description: '', included: true },
    ]);
  };

  const removeDeliverable = (id) => {
    if (deliverables.length <= 1) return;
    updateSection('deliverables', deliverables.filter((d) => d.id !== id));
  };

  const updateDeliverable = (id, field, value) => {
    updateSection(
      'deliverables',
      deliverables.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
    dragRef.current = index;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const startIndex = dragRef.current;
    if (startIndex === null || startIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const items = [...deliverables];
    const [moved] = items.splice(startIndex, 1);
    items.splice(dropIndex, 0, moved);
    updateSection('deliverables', items);
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Scope & Deliverables</h2>
        <p className="text-dark-muted">What will you deliver? Drag to reorder.</p>
      </div>

      <div className="space-y-4">
        {deliverables.map((del, index) => (
          <div
            key={del.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-dark-surface border rounded-lg p-4 transition-all ${
              dragIndex === index
                ? 'opacity-50 border-primary border-dashed'
                : overIndex === index
                ? 'border-t-primary border-t-2 border-dark-border'
                : 'border-dark-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="cursor-grab active:cursor-grabbing text-dark-muted hover:text-primary mt-1 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={del.title}
                    onChange={(e) => updateDeliverable(del.id, 'title', e.target.value)}
                    placeholder="Deliverable title..."
                    className="flex-1 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition text-sm"
                  />
                  <button
                    onClick={() => updateDeliverable(del.id, 'included', !del.included)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                      del.included
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {del.included ? 'Included' : 'Excluded'}
                  </button>
                </div>
                <textarea
                  value={del.description}
                  onChange={(e) => updateDeliverable(del.id, 'description', e.target.value)}
                  placeholder="Description of this deliverable..."
                  rows={2}
                  className="w-full bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition text-sm resize-none"
                />
              </div>

              <button
                onClick={() => removeDeliverable(del.id)}
                disabled={deliverables.length <= 1}
                className="p-1.5 text-dark-muted hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition mt-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addDeliverable}
        className="flex items-center gap-2 text-primary hover:text-primary-light text-sm font-medium transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Deliverable
      </button>
    </div>
  );
};

export default DeliverablesStep;
