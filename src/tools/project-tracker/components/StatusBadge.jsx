import { healthColors, statusColors } from '../utils/helpers';

export default function StatusBadge({ status, type = 'health' }) {
  const colors = type === 'health' ? healthColors : statusColors;
  const config = colors[status] || { bg: 'bg-text-muted/20', text: 'text-text-muted', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')} mr-1.5`} />
      {config.label}
    </span>
  );
}
