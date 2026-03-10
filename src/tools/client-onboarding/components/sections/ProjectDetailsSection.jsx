import { useState } from 'react';
import { FormField, TextInput, TextArea, Select } from '../FormField';
import { PROJECT_TYPES, BUDGET_RANGES } from '../../data/sections';

export default function ProjectDetailsSection({ data = {}, onChange }) {
  const [newGoal, setNewGoal] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');

  const update = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const goals = [...(data.goals || []), newGoal.trim()];
    update('goals', goals);
    setNewGoal('');
  };

  const removeGoal = (idx) => {
    const goals = (data.goals || []).filter((_, i) => i !== idx);
    update('goals', goals);
  };

  const addCompetitor = () => {
    if (!newCompetitor.trim()) return;
    const competitors = [...(data.competitors || []), newCompetitor.trim()];
    update('competitors', competitors);
    setNewCompetitor('');
  };

  const removeCompetitor = (idx) => {
    const competitors = (data.competitors || []).filter((_, i) => i !== idx);
    update('competitors', competitors);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-dark-text">Project Details</h3>
          <p className="text-xs text-dark-muted">Tell us about your project</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Project Type" required>
          <Select
            value={data.projectType}
            onChange={(v) => update('projectType', v)}
            options={PROJECT_TYPES}
            placeholder="Select project type..."
            required
          />
        </FormField>

        <FormField label="Budget Range" required>
          <Select
            value={data.budgetRange}
            onChange={(v) => update('budgetRange', v)}
            options={BUDGET_RANGES}
            placeholder="Select budget range..."
            required
          />
        </FormField>
      </div>

      <FormField label="Project Description" required>
        <TextArea
          value={data.description}
          onChange={(v) => update('description', v)}
          placeholder="Describe your project in detail. What do you need built? What problems are you trying to solve?"
          rows={5}
          required
        />
      </FormField>

      <FormField label="Target Audience" required>
        <TextArea
          value={data.targetAudience}
          onChange={(v) => update('targetAudience', v)}
          placeholder="Who is your target audience? Demographics, interests, behaviors..."
          rows={3}
          required
        />
      </FormField>

      <FormField label="Timeline / Deadline">
        <TextInput
          value={data.timeline}
          onChange={(v) => update('timeline', v)}
          placeholder="e.g., 6 weeks, by March 2026, ASAP"
        />
      </FormField>

      {/* Goals */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">Goals & Objectives</label>
        <div className="flex gap-2 mb-3">
          <TextInput
            value={newGoal}
            onChange={setNewGoal}
            placeholder="Add a project goal..."
          />
          <button
            type="button"
            onClick={addGoal}
            className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium shrink-0 cursor-pointer"
          >
            Add
          </button>
        </div>
        {data.goals?.length > 0 && (
          <div className="space-y-2">
            {data.goals.map((goal, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-dark-bg rounded-lg px-3 py-2 animate-slide-in">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm text-dark-text flex-1">{goal}</span>
                <button
                  type="button"
                  onClick={() => removeGoal(idx)}
                  className="text-dark-muted hover:text-danger transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Competitors */}
      <div>
        <label className="block text-sm font-medium text-dark-text mb-2">Competitors / Inspiration URLs</label>
        <div className="flex gap-2 mb-3">
          <TextInput
            value={newCompetitor}
            onChange={setNewCompetitor}
            placeholder="https://competitor-website.com"
          />
          <button
            type="button"
            onClick={addCompetitor}
            className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-medium shrink-0 cursor-pointer"
          >
            Add
          </button>
        </div>
        {data.competitors?.length > 0 && (
          <div className="space-y-2">
            {data.competitors.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-dark-bg rounded-lg px-3 py-2 animate-slide-in">
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm text-dark-text flex-1 truncate">{url}</span>
                <button
                  type="button"
                  onClick={() => removeCompetitor(idx)}
                  className="text-dark-muted hover:text-danger transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
