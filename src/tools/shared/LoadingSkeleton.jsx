export default function LoadingSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="rounded"
          style={{
            background: 'var(--bg-elevated)',
            height: '14px',
            width: i === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  )
}

export function CardSkeleton({ className = '' }) {
  return (
    <div
      className={`rounded-xl p-6 ${className}`}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-5 rounded w-1/3" style={{ background: 'var(--bg-elevated)' }} />
        <div className="space-y-2">
          <div className="h-3 rounded" style={{ background: 'var(--bg-elevated)' }} />
          <div className="h-3 rounded w-5/6" style={{ background: 'var(--bg-elevated)' }} />
          <div className="h-3 rounded w-4/6" style={{ background: 'var(--bg-elevated)' }} />
        </div>
        <div className="flex gap-3">
          <div className="h-8 rounded-lg w-20" style={{ background: 'var(--bg-elevated)' }} />
          <div className="h-8 rounded-lg w-20" style={{ background: 'var(--bg-elevated)' }} />
        </div>
      </div>
    </div>
  )
}
