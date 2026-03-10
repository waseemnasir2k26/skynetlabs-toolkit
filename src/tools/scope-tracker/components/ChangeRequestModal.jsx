import React, { useState } from 'react';
import { generateId } from '../utils/helpers';

const categories = ['New Feature', 'Change', 'Bug Fix', 'Additional Content', 'Design Change'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const statuses = ['Pending', 'Approved', 'Rejected', 'Completed'];

export default function ChangeRequestModal({ onSave, onClose, editRequest }) {
  const [form, setForm] = useState(
    editRequest || {
      id: generateId(),
      description: '',
      dateRequested: new Date().toISOString().split('T')[0],
      hours: '',
      timelineImpact: '',
      priority: 'Medium',
      category: 'New Feature',
      status: 'Pending',
      clientQuote: '',
    }
  );

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const canSubmit = form.description.trim() && form.hours;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-800 border border-dark-400 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
        <div className="sticky top-0 bg-dark-800 border-b border-dark-500 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-100">
            {editRequest ? 'Edit Change Request' : 'Log New Request'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label>Request Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe what the client is requesting..."
              rows={3}
              className="w-full resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Date Requested</label>
              <input
                type="date"
                value={form.dateRequested}
                onChange={(e) => updateField('dateRequested', e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label>Estimated Additional Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.hours}
                onChange={(e) => updateField('hours', e.target.value)}
                placeholder="8"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Timeline Impact (days)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.timelineImpact}
                onChange={(e) => updateField('timelineImpact', e.target.value)}
                placeholder="2"
                className="w-full"
              />
            </div>
            <div>
              <label>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => updateField('priority', e.target.value)}
                className="w-full"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label>Client Quote / Notes</label>
            <textarea
              value={form.clientQuote}
              onChange={(e) => updateField('clientQuote', e.target.value)}
              placeholder="What did the client say? e.g. 'Can we also add a blog section?'"
              rows={2}
              className="w-full resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={!canSubmit} className="btn-primary">
              {editRequest ? 'Update Request' : 'Log Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
