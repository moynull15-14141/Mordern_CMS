'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/feedback/page-loader';
import type { PermissionKey } from '@/constants/permissions';

export interface PermissionRouteProps {
  /** OR semantics by default, matching PermissionGate/the backend's
   * RequireAnyPermission. */
  permissions: PermissionKey | PermissionKey[];
  requireAll?: boolean;
  children: ReactNode;
}

/**
 * Route Guard (page-level) — docs/60_ADMIN_NAVIGATION.md "Route Guards"
 * step 2: redirects to /403 (never /login — the user IS authenticated)
 * when the current route's permission requirement isn't met. Distinct from
 * PermissionGate (Component Guard), which hides a subtree within an
 * otherwise-rendered page rather than redirecting away from the whole
 * page. Authentication itself is handled by ProtectedRoute at the
 * (dashboard) layout level, one level above every consumer of this guard.
 */
export function PermissionRoute({
  permissions,
  requireAll = false,
  children,
}: PermissionRouteProps) {
  const { canAny, canAll } = usePermissions();
  const router = useRouter();
  const required = Array.isArray(permissions) ? permissions : [permissions];
  const allowed = requireAll ? canAll(required) : canAny(required);

  useEffect(() => {
    if (!allowed) router.replace(ROUTES.FORBIDDEN);
  }, [allowed, router]);

  if (!allowed) return <PageLoader />;

  return <>{children}</>;
}
