import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SIZE_CLASSES: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
};

/** docs/57_DESIGN_SYSTEM.md "Loading" — in-place loading (button
 * mid-mutation, a table refetching), never a full-page overlay. */
export function LoadingSpinner({ className, size = 'md', label }: LoadingSpinnerProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2 text-muted-foreground', className)}
      role="status"
    >
      <Loader2 className={cn('animate-spin', SIZE_CLASSES[size])} aria-hidden="true" />
      {label ? <span className="text-sm">{label}</span> : <span className="sr-only">Loading…</span>}
    </span>
  );
}
