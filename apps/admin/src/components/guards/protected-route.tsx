'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { buildLoginRedirectUrl } from '@/utils/routes';
import { PageLoader } from '@/components/feedback/page-loader';

/**
 * Route Guard — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Authentication" /
 * docs/60_ADMIN_NAVIGATION.md "Route Guards". Wraps the (dashboard) layout;
 * redirects to /login (preserving the originally-requested path) if the
 * session isn't authenticated. This is UX only — the backend independently
 * re-enforces authentication on every request (docs/55_FRONTEND_HANDOFF.md).
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.replace(buildLoginRedirectUrl(currentPath));
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
