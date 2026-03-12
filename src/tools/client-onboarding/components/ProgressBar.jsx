export default function ProgressBar({ currentStep, totalSteps, completionPercent, sectionTitles = [] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-dark-muted">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="font-semibold" style={{ color: 'var(--accent)' }}>{completionPercent}% Complete</span>
      </div>
      <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${completionPercent}%`, background: 'var(--accent)' }}
        />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-colors duration-300"
            style={
              i < currentStep
                ? { background: 'var(--accent)' }
                : i === currentStep
                ? { background: 'var(--accent-soft)' }
                : { background: 'var(--border)' }
            }
            title={sectionTitles[i] || `Step ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
