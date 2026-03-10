import React, { useState } from 'react';
import { generateChangeOrderPDF } from '../utils/pdfGenerator';
import {
  formatCurrency,
  formatDate,
  calcProjectStats,
  getPriorityColor,
} from '../utils/helpers';
import { useToast } from '../../shared/Toast';

export default function ChangeOrders({ project, onUpdate }) {
  const [selected, setSelected] = useState(new Set());
  const [generating, setGenerating] = useState(false);
  const stats = calcProjectStats(project);
  const toast = useToast();

  const pendingRequests = project.changeRequests.filter(
    (r) => r.status === 'Pending' || r.status === 'Approved'
  );

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === pendingRequests.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingRequests.map((r) => r.id)));
    }
  };

  const selectedRequests = pendingRequests.filter((r) => selected.has(r.id));
  const selectedCost = selectedRequests.reduce(
    (s, r) => s + (parseFloat(r.hours) || 0) * stats.rate,
    0
  );
  const selectedHours = selectedRequests.reduce(
    (s, r) => s + (parseFloat(r.hours) || 0),
    0
  );

  const handleGenerate = async () => {
    if (selectedRequests.length === 0) return;
    setGenerating(true);
    try {
      const orderNumber = await generateChangeOrderPDF(
        project,
        selectedRequests,
        stats
      );
      const newOrder = {
        id: `co-${orderNumber}`,
        number: orderNumber,
        date: new Date().toISOString().split('T')[0],
        requestIds: selectedRequests.map((r) => r.id),
        totalCost: selectedCost,
        totalHours: selectedHours,
        status: 'Sent',
      };
      onUpdate({
        ...project,
        changeOrders: [...(project.changeOrders || []), newOrder],
      });
      setSelected(new Set());
      if (toast) toast('Change order PDF generated!', 'success');
    } catch (err) {
      console.error('PDF generation failed:', err);
      if (toast) toast('PDF generation failed.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const updateOrderStatus = (orderId, status) => {
    onUpdate({
      ...project,
      changeOrders: (project.changeOrders || []).map((o) =>
        o.id === orderId ? { ...o, status } : o
      ),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Change Order Generator</h1>
        <p className="text-gray-500 mt-0.5">
          {project.projectName} &middot; Select requests to include in a change order
        </p>
      </div>

      {/* Select requests */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-200">Pending Requests</h2>
          {pendingRequests.length > 0 && (
            <button onClick={selectAll} className="btn-secondary text-sm !px-3 !py-1.5">
              {selected.size === pendingRequests.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No pending or approved requests to include.</p>
            <p className="text-sm mt-1">
              Log change requests from the Dashboard first.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-4 bg-dark-700 rounded-lg p-4 cursor-pointer transition-all duration-200 border-2 ${
                  selected.has(r.id)
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-transparent hover:border-dark-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={() => toggleSelect(r.id)}
                  className="w-4 h-4 rounded border-dark-400 text-primary focus:ring-primary/30 bg-dark-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200 truncate">
                      {r.description}
                    </span>
                    <span className={`badge border ${getPriorityColor(r.priority)}`}>
                      {r.priority}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {r.category} &middot; {r.hours}h &middot; +{r.timelineImpact || 0}d
                  </div>
                </div>
                <div className="text-sm font-mono text-primary shrink-0">
                  {formatCurrency((parseFloat(r.hours) || 0) * stats.rate)}
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Generate summary */}
        {selectedRequests.length > 0 && (
          <div className="bg-dark-700 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 border border-primary/20">
            <div>
              <div className="text-sm text-gray-400">
                {selectedRequests.length} item(s) selected
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(selectedCost)}
                </span>
                <span className="text-sm text-gray-400">{selectedHours}h additional</span>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary flex items-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Change Order PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Previous change orders */}
      {project.changeOrders?.length > 0 && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-200">Previous Change Orders</h2>
          <div className="space-y-2">
            {project.changeOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between bg-dark-700 rounded-lg p-4"
              >
                <div>
                  <div className="text-sm font-medium text-gray-200">
                    CO-{String(o.number).padStart(4, '0')}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {formatDate(o.date)} &middot; {o.requestIds?.length || 0} items &middot;{' '}
                    {o.totalHours}h &middot; {formatCurrency(o.totalCost)}
                  </div>
                </div>
                <select
                  value={o.status}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                  className="!bg-dark-600 !py-1.5 !px-3 text-sm"
                >
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
