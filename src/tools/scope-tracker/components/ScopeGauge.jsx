import React from 'react';
import { getCreepColor, getCreepLabel } from '../utils/helpers';

export default function ScopeGauge({ percentage, size = 160 }) {
  const capped = Math.min(percentage, 100);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (capped / 100) * circumference;
  const color = getCreepColor(percentage);
  const label = getCreepLabel(percentage);
  const center = size / 2;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1a1a28"
            strokeWidth="10"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-circle"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {percentage.toFixed(1)}%
          </span>
          <span className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>scope creep</span>
        </div>
      </div>
      <div
        className="mt-2 badge border"
        style={{
          color,
          backgroundColor: `${color}15`,
          borderColor: `${color}30`,
        }}
      >
        {label}
      </div>
    </div>
  );
}
