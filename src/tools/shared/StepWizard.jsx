export default function StepWizard({ steps, currentStep, onStepClick }) {
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isActive = i === currentStep
        const isCompleted = i < currentStep
        const stepNum = i + 1

        return (
          <div key={i} className="flex items-center flex-shrink-0">
            <button
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                cursor: onStepClick ? 'pointer' : 'default',
              }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
                style={{
                  background: isActive ? 'var(--accent)' : isCompleted ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: isActive || isCompleted ? 'var(--text-on-accent)' : 'var(--text-muted)',
                  border: !isActive && !isCompleted ? '1px solid var(--border)' : 'none',
                }}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : stepNum}
              </span>
              <span
                className="font-medium hidden sm:inline"
                style={{
                  color: isActive ? 'var(--accent)' : isCompleted ? 'var(--text-body)' : 'var(--text-muted)',
                }}
              >
                {step}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className="w-8 h-px mx-1 flex-shrink-0"
                style={{
                  background: isCompleted ? 'var(--accent)' : 'var(--border)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
