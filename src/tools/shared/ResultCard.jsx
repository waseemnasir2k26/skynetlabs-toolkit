export default function ResultCard({ title, icon, children, className = '' }) {
  return (
    <div className={`rounded-xl p-6 ${className}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon && <span className="text-xl">{icon}</span>}
          {title && <h3 className="font-semibold text-lg" style={{ color: 'var(--text-heading)' }}>{title}</h3>}
        </div>
      )}
      {children}
    </div>
  )
}
