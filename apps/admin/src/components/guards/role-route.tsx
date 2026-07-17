'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/use-permissions';
import { ROUTES } from '@/constants/routes';
import { PageLoader } from '@/components/feedback/page-loader';
import type { SystemRole } from '@/constants/permissions';

export interface RoleRouteProps {
  /** OR semantics — any listed role grants access, matching RoleGate/the
   * backend's RequireRole decorator. */
  roles: SystemRole | SystemRole[];
  children: ReactNode;
}

/**
 * Route Guard (page-level) — role-based counterpart to PermissionRoute, for
 * a future route whose access is defined by role rather than permission
 * (no route in the current frozen navigation manifest needs this yet —
 * docs/60_ADMIN_NAVIGATION.md's table is entirely permission-gated — this
 * exists as reusable infrastructure ahead of that need, matching Frontend
 * Milestone 1's "infrastructure ahead of pages" precedent).
 */
export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { isRole } = usePermissions();
  const router = useRouter();
  const required = Array.isArray(roles) ? roles : [roles];
  const allowed = required.some((role) => isRole(role));

  useEffect(() => {
    if (!allowed) router.replace(ROUTES.FORBIDDEN);
  }, [allowed, router]);

  if (!allowed) return <PageLoader />;

  return <>{children}</>;
}
