import { useProposal } from '../../context/ProposalContext';
import { defaultTerms } from '../../utils/defaultData';

const TermsStep = () => {
  const { proposal, updateSection } = useProposal();

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Terms & Conditions</h2>
        <p className="text-dark-muted">Edit the default terms or write your own.</p>
      </div>

      <textarea
        value={proposal.terms}
        onChange={(e) => updateSection('terms', e.target.value)}
        rows={18}
        className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition resize-y text-sm leading-relaxed font-mono"
      />

      <button
        onClick={() => updateSection('terms', defaultTerms)}
        className="text-sm text-dark-muted hover:text-primary transition"
      >
        Reset to default terms
      </button>
    </div>
  );
};

export default TermsStep;
