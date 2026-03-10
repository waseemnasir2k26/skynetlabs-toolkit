export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description,
  action,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm max-w-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'var(--accent)', color: 'var(--text-on-accent)' }}
        >
          {action}
        </button>
      )}
    </div>
  )
}
