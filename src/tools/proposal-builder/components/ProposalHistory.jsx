import { useState, useEffect } from 'react';
import { getProposals, deleteProposal } from '../utils/storage';
import { useProposal } from '../context/ProposalContext';

const ProposalHistory = ({ onClose }) => {
  const [proposals, setProposals] = useState([]);
  const { setProposal, setStep } = useProposal();

  useEffect(() => {
    setProposals(getProposals());
  }, []);

  const handleLoad = (proposal) => {
    setProposal(proposal);
    setStep(0);
    onClose();
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this proposal?')) {
      deleteProposal(id);
      setProposals(getProposals());
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h2 className="text-lg font-bold text-white">Saved Proposals</h2>
          <button onClick={onClose} className="text-dark-muted hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {proposals.length === 0 ? (
            <div className="text-center text-dark-muted py-12">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No saved proposals yet</p>
              <p className="text-xs mt-1">Your proposals will appear here when you save them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposals.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLoad(p)}
                  className="w-full text-left bg-dark-surface border border-dark-border rounded-lg p-4 hover:border-primary/50 transition group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate group-hover:text-primary transition">
                        {p.project?.title || 'Untitled Proposal'}
                      </h3>
                      <p className="text-dark-muted text-xs mt-1">
                        {p.clientInfo?.company || p.clientInfo?.name || 'No client'}
                      </p>
                      <p className="text-dark-muted text-[10px] mt-1">
                        Updated {formatDate(p.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="p-1.5 text-dark-muted hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalHistory;
