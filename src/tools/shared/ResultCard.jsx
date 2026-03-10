export default function ResultCard({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-dark-100/50 border border-white/5 rounded-xl p-6 ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4">
          {icon && <span className="text-xl">{icon}</span>}
          {title && <h3 className="text-white font-semibold text-lg">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  )
}
