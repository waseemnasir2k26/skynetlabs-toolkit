import { useProposal } from '../context/ProposalContext';

const templates = [
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    desc: 'Sleek dark theme with green accents',
    preview: ['#0f0f18', '#13b973', '#171724'],
  },
  {
    id: 'classic-white',
    name: 'Classic White',
    desc: 'Clean, professional light theme',
    preview: ['#ffffff', '#13b973', '#f8f9fa'],
  },
  {
    id: 'colorful',
    name: 'Colorful',
    desc: 'Bold purple with teal accents',
    preview: ['#1a0a2e', '#00e5a0', '#251245'],
  },
];

const TemplateSelector = () => {
  const { proposal, setTemplate } = useProposal();

  return (
    <div className="flex gap-3">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => setTemplate(t.id)}
          className={`flex-1 p-3 rounded-lg border transition-all ${
            proposal.template === t.id
              ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
              : 'border-dark-border bg-dark-surface hover:border-dark-muted'
          }`}
        >
          <div className="flex gap-1 mb-2">
            {t.preview.map((color, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded"
                style={{ background: color, border: '1px solid rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>
          <div className="text-xs font-medium text-white text-left">{t.name}</div>
          <div className="text-[10px] text-dark-muted text-left">{t.desc}</div>
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;
