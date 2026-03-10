import { useProposal } from '../../context/ProposalContext';

const YourInfoStep = () => {
  const { proposal, updateField } = useProposal();
  const { yourInfo } = proposal;

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField('yourInfo', 'logo', reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Your Information</h2>
        <p className="text-dark-muted">Tell us about yourself or your company.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-dark-muted mb-1.5">Your Name *</label>
          <input
            type="text"
            value={yourInfo.name}
            onChange={(e) => updateField('yourInfo', 'name', e.target.value)}
            placeholder="John Doe"
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-muted mb-1.5">Company Name</label>
          <input
            type="text"
            value={yourInfo.company}
            onChange={(e) => updateField('yourInfo', 'company', e.target.value)}
            placeholder="Your Company"
            className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-muted mb-1.5">Email Address *</label>
        <input
          type="email"
          value={yourInfo.email}
          onChange={(e) => updateField('yourInfo', 'email', e.target.value)}
          placeholder="you@company.com"
          className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-muted mb-1.5">Tagline</label>
        <input
          type="text"
          value={yourInfo.tagline}
          onChange={(e) => updateField('yourInfo', 'tagline', e.target.value)}
          placeholder="Your professional tagline or slogan"
          className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-white placeholder-dark-muted/50 focus:outline-none focus:border-primary transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-muted mb-1.5">Logo</label>
        <div className="flex items-center gap-4">
          {yourInfo.logo && (
            <div className="w-16 h-16 rounded-lg bg-dark-surface border border-dark-border p-1 flex items-center justify-center">
              <img src={yourInfo.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <label className="cursor-pointer bg-dark-surface border border-dark-border hover:border-primary rounded-lg px-4 py-3 text-dark-muted hover:text-primary transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {yourInfo.logo ? 'Change Logo' : 'Upload Logo'}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
          {yourInfo.logo && (
            <button
              onClick={() => updateField('yourInfo', 'logo', null)}
              className="text-red-400 hover:text-red-300 text-sm transition"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourInfoStep;
