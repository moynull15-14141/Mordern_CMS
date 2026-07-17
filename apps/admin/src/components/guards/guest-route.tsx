'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { getRedirectTarget } from '@/utils/routes';
import { PageLoader } from '@/components/feedback/page-loader';

/**
 * GuestRoute — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Layout System"
 * (Authentication Layout: "redirect-if-already-authenticated guard").
 * Wraps (auth) routes (login, forgot-password, reset-password).
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(getRedirectTarget(searchParams));
    }
  }, [isLoading, isAuthenticated, router, searchParams]);

  if (isLoading || isAuthenticated) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
