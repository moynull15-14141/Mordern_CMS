import { cn } from '@/utils/cn';

/** Green/yellow/red live character counter — thresholds mirror
 * `computeSeoScore`'s title (10-60) / description (50-160) ranges so the
 * counter and the checklist never disagree. */
export function CharacterCounter({
  length,
  min,
  max,
}: {
  length: number;
  min: number;
  max: number;
}) {
  const state = length === 0 ? 'empty' : length < min || length > max ? 'bad' : 'good';
  const nearLimit = length > 0 && (length < min * 1.2 || length > max * 0.9) && state === 'good';

  return (
    <span
      className={cn(
        'text-xs font-medium tabular-nums',
        state === 'empty' && 'text-muted-foreground',
        state === 'bad' && 'text-destructive',
        state === 'good' && !nearLimit && 'text-success',
        state === 'good' && nearLimit && 'text-warning'
      )}
    >
      {length} / {max}
    </span>
  );
}
