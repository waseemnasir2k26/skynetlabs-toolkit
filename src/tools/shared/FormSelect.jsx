export default function FormSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  required,
  helpText,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-heading)' }}>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}> *</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none"
        style={{
          background: 'var(--bg-input)',
          border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
          color: value ? 'var(--text-heading)' : 'var(--text-muted)',
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value
          const lbl = typeof opt === 'string' ? opt : opt.label
          return (
            <option key={val} value={val}>{lbl}</option>
          )
        })}
      </select>
      {helpText && !error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
      )}
    </div>
  )
}
