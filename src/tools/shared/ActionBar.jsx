export default function ActionBar({ children, className = '' }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-3 p-4 rounded-xl ${className}`}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}
    >
      {children}
    </div>
  )
}

export function ActionButton({
  onClick,
  icon,
  children,
  variant = 'default',
  disabled,
  className = '',
}) {
  const variants = {
    default: {
      background: 'var(--bg-card)',
      color: 'var(--text-body)',
      border: '1px solid var(--border)',
    },
    primary: {
      background: 'var(--accent)',
      color: 'var(--text-on-accent)',
      border: 'none',
    },
    danger: {
      background: 'var(--danger-soft)',
      color: 'var(--danger)',
      border: '1px solid var(--danger-soft)',
    },
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${className}`}
      style={variants[variant] || variants.default}
    >
      {icon}
      {children}
    </button>
  )
}
