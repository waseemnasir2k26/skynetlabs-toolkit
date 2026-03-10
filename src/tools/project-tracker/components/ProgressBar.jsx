export default function ProgressBar({ value = 0, size = 'md', showLabel = true, className = '' }) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const h = heights[size] || heights.md;

  const getColor = (val) => {
    if (val >= 100) return 'bg-status-blue';
    if (val >= 60) return 'bg-primary';
    if (val >= 30) return 'bg-status-amber';
    return 'bg-status-red';
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex-1 ${h} bg-border rounded-full overflow-hidden`}>
        <div
          className={`${h} ${getColor(value)} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-text-secondary min-w-[3ch] text-right">
          {value}%
        </span>
      )}
    </div>
  );
}
