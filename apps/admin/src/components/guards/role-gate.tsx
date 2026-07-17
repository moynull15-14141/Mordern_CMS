'use client';

import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import type { SystemRole } from '@/constants/permissions';

export interface RoleGateProps {
  /** OR semantics — any listed role grants access, matching the backend's
   * RequireRole decorator (docs/38_RBAC_ARCHITECTURE.md). */
  roles: SystemRole | SystemRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { isRole } = usePermissions();
  const required = Array.isArray(roles) ? roles : [roles];
  const allowed = required.some((role) => isRole(role));

  return <>{allowed ? children : fallback}</>;
}
