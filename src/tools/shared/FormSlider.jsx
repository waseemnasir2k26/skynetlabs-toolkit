export default function FormSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  valueFormat,
  helpText,
  className = '',
}) {
  const percent = ((value - min) / (max - min)) * 100
  const displayValue = valueFormat ? valueFormat(value) : value

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className="text-sm font-medium" style={{ color: 'var(--text-heading)' }}>
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
              {displayValue}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        style={{ '--value-percent': `${percent}%` }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{min}</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{max}</span>
      </div>
      {helpText && (
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{helpText}</p>
      )}
    </div>
  )
}
