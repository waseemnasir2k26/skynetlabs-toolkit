export default function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  required,
  rows = 4,
  helpText,
  error,
  maxLength,
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
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className="w-full rounded-lg px-3 py-2.5 text-sm transition-all focus:outline-none resize-y"
        style={{
          background: 'var(--bg-input)',
          border: error ? '1px solid var(--danger)' : '1px solid var(--border)',
          color: 'var(--text-heading)',
        }}
        {...props}
      />
      <div className="flex justify-between mt-1">
        {(helpText && !error) ? (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{helpText}</p>
        ) : error ? (
          <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>
        ) : <span />}
        {maxLength && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {(value || '').length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
