import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/** Page container / Content container — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md
 * "Layout System". PageContainer bounds max-width and horizontal padding
 * consistently across every future page; ContentContainer is the inner
 * vertical-rhythm wrapper for a page's main content blocks. */
export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8', className)}
      {...props}
    />
  );
}

export function ContentContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-6', className)} {...props} />;
}
