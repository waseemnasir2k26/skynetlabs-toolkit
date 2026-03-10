import { useProposal } from '../../context/ProposalContext';

const ClientInfoStep = () => {
  const { proposal, updateField } = useProposal();
  const { clientInfo } = proposal;

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Client Information</h2>
        <p className="text-dark-muted">Who is this proposal for?</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-muted mb-1.5">Client Name *</label>
        <input
          type="text"
          value={clientInfo.name}
          onChange={(e) => updateField('clientInfo', 'name', e.target.value)}
          placeholder="Jane Smith"
          className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-muted mb-1.5">Client Company *</label>
        <input
          type="text"
          value={clientInfo.company}
          onChange={(e) => updateField('clientInfo', 'company', e.target.value)}
          placeholder="Client's Company Name"
          className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-muted mb-1.5">Client Email</label>
        <input
          type="email"
          value={clientInfo.email}
          onChange={(e) => updateField('clientInfo', 'email', e.target.value)}
          placeholder="client@company.com"
          className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition"
        />
      </div>
    </div>
  );
};

export default ClientInfoStep;
