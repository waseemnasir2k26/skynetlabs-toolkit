import React, { useState } from 'react';
import { generateId, formatCurrency } from '../utils/helpers';

const emptyDeliverable = { id: '', name: '', hours: '', rate: '' };

export default function ProjectSetup({ onSave, editProject }) {
  const [form, setForm] = useState(
    editProject || {
      id: generateId(),
      projectName: '',
      clientName: '',
      startDate: '',
      deadline: '',
      contractValue: '',
      deliverables: [{ ...emptyDeliverable, id: generateId() }],
      changeRequests: [],
      changeOrders: [],
      archived: false,
      createdAt: new Date().toISOString(),
    }
  );

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const addDeliverable = () =>
    setForm((f) => ({
      ...f,
      deliverables: [...f.deliverables, { ...emptyDeliverable, id: generateId() }],
    }));

  const updateDeliverable = (id, field, value) =>
    setForm((f) => ({
      ...f,
      deliverables: f.deliverables.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      ),
    }));

  const removeDeliverable = (id) =>
    setForm((f) => ({
      ...f,
      deliverables: f.deliverables.filter((d) => d.id !== id),
    }));

  const totalHours = form.deliverables.reduce(
    (s, d) => s + (parseFloat(d.hours) || 0),
    0
  );
  const totalValue = form.deliverables.reduce(
    (s, d) => s + (parseFloat(d.hours) || 0) * (parseFloat(d.rate) || 0),
    0
  );

  const canSubmit =
    form.projectName.trim() &&
    form.clientName.trim() &&
    form.deliverables.length > 0 &&
    form.deliverables.every((d) => d.name.trim() && d.hours && d.rate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    const project = {
      ...form,
      deliverables: form.deliverables.map((d) => ({
        ...d,
        status: d.status || 'Not Started',
      })),
    };
    onSave(project);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-heading)' }}>
          {editProject ? 'Edit Project' : 'New Project'}
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
          Define the original scope to start tracking changes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-5">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-body)' }}>Project Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label>Project Name</label>
              <input
                type="text"
                value={form.projectName}
                onChange={(e) => updateField('projectName', e.target.value)}
                placeholder="Website Redesign"
                className="w-full"
              />
            </div>
            <div>
              <label>Client Name</label>
              <input
                type="text"
                value={form.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
                placeholder="Acme Corp"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label>Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => updateField('deadline', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label>Contract Value ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.contractValue}
                onChange={(e) => updateField('contractValue', e.target.value)}
                placeholder="5000"
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-body)' }}>
              Original Scope / Deliverables
            </h2>
            <button type="button" onClick={addDeliverable} className="btn-secondary text-sm !px-4 !py-2">
              + Add Item
            </button>
          </div>

          <div className="space-y-3">
            {form.deliverables.map((d, idx) => (
              <div
                key={d.id}
                className="flex items-start gap-3 rounded-lg p-4 animate-fade-in"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <span className="text-xs font-mono mt-2.5 min-w-[20px]" style={{ color: 'var(--text-muted)' }}>
                  {idx + 1}.
                </span>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-6 gap-3">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={d.name}
                      onChange={(e) => updateDeliverable(d.id, 'name', e.target.value)}
                      placeholder="Deliverable description"
                      className="w-full !bg-dark-600"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={d.hours}
                      onChange={(e) => updateDeliverable(d.id, 'hours', e.target.value)}
                      placeholder="Hours"
                      className="w-full !bg-dark-600"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={d.rate}
                      onChange={(e) => updateDeliverable(d.id, 'rate', e.target.value)}
                      placeholder="$/hr"
                      className="w-full !bg-dark-600"
                    />
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-between">
                    <span className="text-sm font-mono" style={{ color: 'var(--accent)' }}>
                      {formatCurrency((parseFloat(d.hours) || 0) * (parseFloat(d.rate) || 0))}
                    </span>
                    {form.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDeliverable(d.id)}
                        className="transition-colors hover:opacity-80 ml-2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Total Hours: <span className="font-semibold" style={{ color: 'var(--text-body)' }}>{totalHours}</span>
            </div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Total Value:{' '}
              <span className="font-semibold text-base" style={{ color: 'var(--accent)' }}>
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={!canSubmit} className="btn-primary text-base px-8">
            {editProject ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
