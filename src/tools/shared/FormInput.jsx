export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  prefix,
  suffix,
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
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none"
          style={{
            background: 'var(--bg-input)',
            border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
            color: 'var(--text-heading)',
            paddingLeft: prefix ? '2rem' : undefined,
            paddingRight: suffix ? '2.5rem' : undefined,
          }}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {suffix}
          </span>
        )}
      </div>
      {helpText && !error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
      )}
    </div>
  )
}
