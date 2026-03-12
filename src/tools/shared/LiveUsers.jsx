import { TOOL_COUNT } from '../../config/tools'

export default function LiveUsers({ className = '' }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
      style={{
        background: 'var(--accent-soft)',
        color: 'var(--accent)',
        border: '1px solid var(--accent-soft)',
      }}
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
      <span className="tabular-nums font-bold">{TOOL_COUNT}</span>
      <span style={{ color: 'var(--text-muted)' }}>Free Tools</span>
    </div>
  )
}
