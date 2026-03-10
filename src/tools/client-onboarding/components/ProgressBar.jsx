export default function ProgressBar({ currentStep, totalSteps, completionPercent, sectionTitles = [] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-dark-muted">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-primary font-semibold">{completionPercent}% Complete</span>
      </div>
      <div className="w-full h-2 bg-dark-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-dark to-primary-light rounded-full transition-all duration-500 ease-out"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
              i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary/60' : 'bg-dark-border'
            }`}
            title={sectionTitles[i] || `Step ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
