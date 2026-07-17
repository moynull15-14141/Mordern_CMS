'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import type { PermissionKey } from '@/constants/permissions';

export interface PermissionGateProps {
  /** OR semantics by default (any one of these grants access), matching
   * the backend's RequireAnyPermission — docs/60_ADMIN_NAVIGATION.md. */
  permissions: PermissionKey | PermissionKey[];
  /** AND semantics when true — matches RequireAllPermissions. */
  requireAll?: boolean;
  children: ReactNode;
  /** Rendered instead when denied — omit to render nothing (Component
   * Guard's default per docs/56 "Permission Flow"). */
  fallback?: ReactNode;
}

/** Component Guard — hides a whole section a user lacks permission for.
 * Never a substitute for backend enforcement (docs/55_FRONTEND_HANDOFF.md). */
export function PermissionGate({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { canAny, canAll } = usePermissions();
  const required = Array.isArray(permissions) ? permissions : [permissions];
  const allowed = requireAll ? canAll(required) : canAny(required);

  return <>{allowed ? children : fallback}</>;
}
