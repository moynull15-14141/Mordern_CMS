import { cn } from '@/utils/cn';

/** One Skeleton primitive, composed into per-component skeleton variants —
 * docs/57_DESIGN_SYSTEM.md "Skeleton". */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}
