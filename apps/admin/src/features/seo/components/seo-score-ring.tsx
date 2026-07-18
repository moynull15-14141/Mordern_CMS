'use client';

import { cn } from '@/utils/cn';
import type { SeoStatus } from '../lib/seo-score';

const STATUS_COLOR: Record<SeoStatus, string> = {
  excellent: 'stroke-success',
  good: 'stroke-info',
  'needs-improvement': 'stroke-warning',
  poor: 'stroke-destructive',
};

/** Animated circular progress ring — no such primitive exists in
 * `components/ui/` yet, built locally following the same `cn()` + plain
 * SVG approach the rest of the design system uses (no new dependency). */
export function SeoScoreRing({
  score,
  status,
  size = 120,
  strokeWidth = 10,
}: {
  score: number;
  status: SeoStatus;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn(
            'fill-none transition-[stroke-dashoffset] duration-500 ease-out',
            STATUS_COLOR[status]
          )}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold">{score}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
