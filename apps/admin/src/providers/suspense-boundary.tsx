import { Suspense, type ReactNode } from 'react';
import { PageLoader } from '@/components/feedback/page-loader';

export interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/** Consistent Suspense fallback wrapper — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md
 * "Performance Strategy" (Suspense boundaries paired with Skeleton
 * components). Defaults to PageLoader; a route-level Skeleton should be
 * passed explicitly for a more specific loading shape. */
export function SuspenseBoundary({ children, fallback = <PageLoader /> }: SuspenseBoundaryProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
