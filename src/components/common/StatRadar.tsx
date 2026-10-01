import React from 'react';
import { StatType } from '../../types';

interface StatRadarProps {
  stats: Record<StatType, number>;
  size?: number;
}

const STAT_CONFIG: { key: StatType; label: string; icon: string; color: string }[] = [
  { key: 'strength', label: 'STR', icon: '💪', color: '#ef4444' },
  { key: 'stamina', label: 'STA', icon: '🫀', color: '#f97316' },
  { key: 'focus', label: 'FOC', icon: '🧠', color: '#a855f7' },
  { key: 'reflex', label: 'REF', icon: '⚡', color: '#eab308' },
  { key: 'awareness', label: 'AWA', icon: '👁️', color: '#06b6d4' },
  { key: 'knowledge', label: 'KNO', icon: '📚', color: '#3b82f6' },
  { key: 'recovery', label: 'REC', icon: '😴', color: '#10b981' },
  { key: 'confidence', label: 'CON', icon: '🗣️', color: '#ec4899' },
  { key: 'discipline', label: 'DIS', icon: '🎯', color: '#8b5cf6' }
];

export const StatRadar: React.FC<StatRadarProps> = ({ stats, size = 320 }) => {
  const center = size / 2;
  const radius = size * 0.38;
  const totalStats = STAT_CONFIG.length;
  const angleStep = (Math.PI * 2) / totalStats;

  // Grid concentric rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Helper to convert polar to cartesian
  const getCoordinates = (index: number, valNorm: number) => {
    // Offset by -PI/2 to start from top
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valNorm;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Build the stat polygon points
  const points = STAT_CONFIG.map((item, idx) => {
    const rawVal = stats[item.key] || 10;
    const norm = Math.max(0.1, Math.min(1.0, rawVal / 100));
    const coord = getCoordinates(idx, norm);
    return `${coord.x},${coord.y}`;
  }).join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Glow Filter */}
        <defs>
          <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Background Rings */}
        {rings.map((ring, rIdx) => {
          const ringPoints = STAT_CONFIG.map((_, idx) => {
            const coord = getCoordinates(idx, ring);
            return `${coord.x},${coord.y}`;
          }).join(' ');
          return (
            <polygon
              key={`ring-${rIdx}`}
              points={ringPoints}
              fill="none"
              stroke="#334155"
              strokeWidth={rIdx === rings.length - 1 ? 1.5 : 1}
              strokeDasharray={rIdx === rings.length - 1 ? 'none' : '3 3'}
              opacity={0.6}
            />
          );
        })}

        {/* Spokes from center to vertices */}
        {STAT_CONFIG.map((_, idx) => {
          const coord = getCoordinates(idx, 1.0);
          return (
            <line
              key={`spoke-${idx}`}
              x1={center}
              y1={center}
              x2={coord.x}
              y2={coord.y}
              stroke="#334155"
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {/* Filled Stat Polygon */}
        <polygon
          points={points}
          fill="url(#radar-fill)"
          stroke="#00e5ff"
          strokeWidth={2.5}
          filter="url(#radar-glow)"
          className="transition-all duration-700 ease-out"
        />

        {/* Stat Value Dots */}
        {STAT_CONFIG.map((item, idx) => {
          const rawVal = stats[item.key] || 10;
          const norm = Math.max(0.1, Math.min(1.0, rawVal / 100));
          const coord = getCoordinates(idx, norm);
          return (
            <circle
              key={`dot-${item.key}`}
              cx={coord.x}
              cy={coord.y}
              r={4}
              fill="#ffffff"
              stroke={item.color}
              strokeWidth={2}
              className="transition-all duration-700 ease-out"
            />
          );
        })}

        {/* Vertex Labels & Values */}
        {STAT_CONFIG.map((item, idx) => {
          const coord = getCoordinates(idx, 1.22);
          const rawVal = Math.round(stats[item.key] || 10);
          return (
            <g key={`label-${item.key}`} transform={`translate(${coord.x}, ${coord.y})`}>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[10px] font-bold fill-slate-300 tracking-wider"
              >
                {item.icon} {item.label}
              </text>
              <text
                textAnchor="middle"
                dominantBaseline="central"
                y={13}
                className="text-[11px] font-extrabold fill-cyan-400"
              >
                {rawVal}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
