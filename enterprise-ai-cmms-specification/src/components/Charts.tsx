import { useMemo } from 'react';
import { faNum } from '../lib/utils';

// Lightweight SVG charts (no external deps)
export function BarChart({ data, height = 180 }: { data: { label: string; value: number; color?: string }[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height / 2}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const h = (d.value / max) * (height / 2 - 18);
        const x = i * w + w * 0.12;
        const y = height / 2 - h - 14;
        return (
          <g key={i}>
            <defs>
              <linearGradient id={`bg-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={d.color || '#ffcb4d'} />
                <stop offset="100%" stopColor={d.color ? d.color : '#b45309'} />
              </linearGradient>
            </defs>
            <rect x={x} y={y} width={w * 0.76} height={h} rx="1" fill={`url(#bg-${i})`} opacity="0.95" />
            <text x={x + w * 0.38} y={height / 2 - 2} fontSize="3" textAnchor="middle" fill="#888896">{d.label}</text>
            <text x={x + w * 0.38} y={y - 1.5} fontSize="3" textAnchor="middle" fill="#ffcb4d" fontWeight="700">{faNum(d.value)}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart({ data, height = 180, color = '#ffcb4d' }: { data: { x: string; y: number }[]; height?: number; color?: string }) {
  const max = Math.max(...data.map(d => d.y), 1);
  const min = Math.min(...data.map(d => d.y), 0);
  const range = max - min || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = (height / 2) - 14 - ((d.y - min) / range) * (height / 2 - 24);
    return [x, y] as const;
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const area = `${path} L 100 ${height / 2 - 14} L 0 ${height / 2 - 14} Z`;
  return (
    <svg viewBox={`0 0 100 ${height / 2}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lc-fill)" />
      <path d={path} stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="0.9" fill={color} />)}
      {data.map((d, i) => i % Math.ceil(data.length / 6) === 0 && (
        <text key={i} x={(i / (data.length - 1 || 1)) * 100} y={height / 2 - 2} fontSize="2.8" textAnchor="middle" fill="#888896">{d.x}</text>
      ))}
    </svg>
  );
}

export function Donut({ value, max = 100, size = 120, label, color = '#ffcb4d' }: { value: number; max?: number; size?: number; label?: string; color?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = 42;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <circle cx="50" cy="50" r={r} stroke="rgba(245,158,11,0.12)" strokeWidth="10" fill="none" />
        <circle cx="50" cy="50" r={r} stroke={color} strokeWidth="10" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform="rotate(-90 50 50)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-2xl text-gold-gradient">{faNum(Math.round(pct))}</div>
        {label && <div className="text-[10px] text-ink-300 mt-1">{label}</div>}
      </div>
    </div>
  );
}

export function Sparkline({ data, color = '#ffcb4d' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((y, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const ny = 24 - ((y - min) / range) * 22;
    return `${x},${ny}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="w-full h-8">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

export function HeatMap({ rows }: { rows: { label: string; values: number[] }[] }) {
  const cols = useMemo(() => Array.from({ length: rows[0]?.values.length || 7 }, (_, i) => i), [rows]);
  return (
    <div className="space-y-1.5">
      {rows.map(r => (
        <div key={r.label} className="flex items-center gap-2">
          <div className="w-24 text-xs text-ink-300 truncate">{r.label}</div>
          <div className="flex-1 grid grid-flow-col auto-cols-fr gap-1">
            {r.values.map((v, i) => {
              const intensity = Math.max(0.08, Math.min(1, v / 100));
              return (
                <div key={i} className="h-6 rounded" title={`${r.label}: ${faNum(v)}`}
                  style={{ background: `rgba(245,158,11,${intensity})` }} />
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex justify-end gap-1 mt-2 text-[10px] text-ink-400">
        <span>کم</span>
        {[0.15, 0.3, 0.5, 0.7, 0.9].map(o => <div key={o} className="w-4 h-3 rounded" style={{ background: `rgba(245,158,11,${o})` }} />)}
        <span>زیاد</span>
        <span className="mr-2 text-ink-500">{cols.length} روز</span>
      </div>
    </div>
  );
}
