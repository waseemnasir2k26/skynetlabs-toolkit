const steps = [
  { label: 'Your Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { label: 'Client', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { label: 'Project', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Deliverables', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { label: 'Timeline', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Pricing', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Terms', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
];

const ProgressBar = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full">
      {/* Mobile view */}
      <div className="md:hidden flex items-center justify-between px-2 py-3">
        <span className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-dark-muted text-sm">{steps[currentStep].label}</span>
      </div>
      <div className="md:hidden w-full bg-dark-border rounded-full h-1.5">
        <div
          className="rounded-full h-1.5 transition-all duration-500"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, background: 'var(--accent)' }}
        />
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-dark-border" />
        <div
          className="absolute top-5 left-0 h-0.5 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%`, background: 'var(--accent)' }}
        />

        {steps.map((step, index) => (
          <button
            key={index}
            onClick={() => onStepClick(index)}
            className="relative flex flex-col items-center group z-10"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
              style={
                index <= currentStep
                  ? { background: 'var(--accent)', color: 'var(--text-heading)', boxShadow: '0 10px 15px -3px var(--accent-soft)' }
                  : { background: 'var(--bg-elevated)', border: '2px solid var(--border)', color: 'var(--text-muted)' }
              }
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                </svg>
              )}
            </div>
            <span
              className="mt-2 text-xs font-medium transition-colors"
              style={
                index <= currentStep
                  ? { color: 'var(--accent)' }
                  : { color: 'var(--text-muted)' }
              }
            >
              {step.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
