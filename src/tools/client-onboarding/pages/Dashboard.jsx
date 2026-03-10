import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getClients, deleteClient, saveClient } from '../utils/storage';
import { calculateCompletion } from '../utils/storage';
import { generateClientPDF } from '../utils/pdf';
import { STATUS_OPTIONS, SECTION_DEFINITIONS } from '../data/sections';

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setClients(getClients());
  }, []);

  const filteredClients = clients.filter(c => {
    const matchSearch = !searchTerm ||
      (c.clientInfo?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.clientInfo?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.clientInfo?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (id) => {
    const updated = deleteClient(id);
    setClients(updated);
    setShowDeleteConfirm(null);
  };

  const handleStatusChange = (id, newStatus) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      const updated = saveClient({ ...client, status: newStatus });
      setClients(updated);
    }
  };

  const handleDownloadPDF = async (client) => {
    await generateClientPDF(client);
  };

  const getStatusColor = (status) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status);
    return opt?.color || '#8888a0';
  };

  const getStatusLabel = (status) => {
    const opt = STATUS_OPTIONS.find(s => s.value === status);
    return opt?.label || 'Unknown';
  };

  const getMissingItems = (client) => {
    const missing = [];
    if (!client.clientInfo?.fullName) missing.push('Client name');
    if (!client.clientInfo?.email) missing.push('Email');
    if (!client.projectDetails?.projectType) missing.push('Project type');
    if (!client.projectDetails?.description) missing.push('Project description');
    if (!client.nda?.signature) missing.push('NDA signature');
    if (!client.serviceAgreement?.signature) missing.push('Service agreement');
    if (!client.paymentInfo?.paymentMethod) missing.push('Payment method');
    return missing;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-dark-text">Client Dashboard</h2>
          <p className="text-sm text-dark-muted mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} onboarded
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/client-onboarding/templates"
            className="px-4 py-2.5 bg-dark-surface border border-dark-border rounded-lg text-sm text-dark-text hover:border-primary/50 transition-colors no-underline flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
            </svg>
            Manage Templates
          </Link>
          <Link
            to="/client-onboarding/templates/new"
            className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors no-underline flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Onboarding Form
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATUS_OPTIONS.map(status => {
          const count = clients.filter(c => c.status === status.value).length;
          return (
            <div
              key={status.value}
              className="bg-dark-card border border-dark-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setStatusFilter(statusFilter === status.value ? 'all' : status.value)}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                <span className="text-xs text-dark-muted uppercase tracking-wider">{status.label}</span>
              </div>
              <p className="text-2xl font-bold text-dark-text">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-muted/50 focus:outline-none focus:border-primary/60 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-dark-card border border-dark-border rounded-lg text-dark-text text-sm cursor-pointer focus:outline-none focus:border-primary/60"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-dark-muted/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-dark-text mb-2">No clients found</h3>
          <p className="text-sm text-dark-muted mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'Create an onboarding form template and share it with your clients to get started.'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link
              to="/client-onboarding/templates/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors no-underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Template
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => {
            const completion = calculateCompletion(client, client.sections || SECTION_DEFINITIONS.map(s => s.id));
            const missing = getMissingItems(client);

            return (
              <div
                key={client.id}
                className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-primary/20 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Client Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-dark-text truncate">
                        {client.clientInfo?.fullName || 'Unnamed Client'}
                      </h3>
                      <select
                        value={client.status}
                        onChange={(e) => handleStatusChange(client.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-full border cursor-pointer bg-transparent focus:outline-none"
                        style={{
                          borderColor: getStatusColor(client.status),
                          color: getStatusColor(client.status),
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-dark-muted">
                      {client.clientInfo?.companyName && (
                        <span>{client.clientInfo.companyName}</span>
                      )}
                      {client.clientInfo?.email && (
                        <span>{client.clientInfo.email}</span>
                      )}
                      {client.projectDetails?.projectType && (
                        <span className="px-2 py-0.5 bg-dark-surface rounded text-xs">{client.projectDetails.projectType}</span>
                      )}
                    </div>
                  </div>

                  {/* Completion */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-24 h-2 bg-dark-border rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${completion}%`,
                              backgroundColor: completion === 100 ? '#13b973' : completion >= 50 ? '#3b82f6' : '#f59e0b',
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-dark-text w-10 text-right">{completion}%</span>
                      </div>
                      <p className="text-xs text-dark-muted">
                        {new Date(client.updatedAt || client.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/client-onboarding/client/${client.id}`}
                        className="p-2 text-dark-muted hover:text-primary transition-colors no-underline"
                        title="View / Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDownloadPDF(client)}
                        className="p-2 text-dark-muted hover:text-primary transition-colors cursor-pointer"
                        title="Download PDF"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(client.id)}
                        className="p-2 text-dark-muted hover:text-danger transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Missing Items */}
                {missing.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-dark-border">
                    <p className="text-xs text-warning flex items-center gap-1 mb-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Missing: {missing.join(' | ')}
                    </p>
                  </div>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm === client.id && (
                  <div className="mt-3 pt-3 border-t border-dark-border flex items-center justify-between bg-danger/5 rounded-lg p-3 -mx-1">
                    <p className="text-sm text-danger">Are you sure you want to delete this client?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1 text-sm text-dark-muted hover:text-dark-text transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="px-3 py-1 text-sm bg-danger text-white rounded-md hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
