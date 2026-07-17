'use client';

import { createContext, useMemo, type ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { hasAllPermissions, hasAnyPermission, hasPermission, hasRole } from '@/utils/permissions';
import type { PermissionKey } from '@/constants/permissions';

export interface PermissionContextValue {
  permissions: string[];
  roles: string[];
  can: (permission: PermissionKey) => boolean;
  canAny: (required: PermissionKey[]) => boolean;
  canAll: (required: PermissionKey[]) => boolean;
  isRole: (role: string) => boolean;
}

export const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

/**
 * Permission Provider — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Permission
 * Flow": "the single cached source every guard reads from." Wraps
 * AuthProvider's permissions/roles in its own context so guard components
 * (PermissionGate/RoleGate) and usePermissions() depend on one explicit
 * provider boundary, distinct from auth session state itself.
 */
export function PermissionProvider({ children }: { children: ReactNode }) {
  const { permissions, roles } = useAuth();

  const value = useMemo<PermissionContextValue>(
    () => ({
      permissions,
      roles,
      can: (permission) => hasPermission(permissions, permission),
      canAny: (required) => hasAnyPermission(permissions, required),
      canAll: (required) => hasAllPermissions(permissions, required),
      isRole: (role) => hasRole(roles, role),
    }),
    [permissions, roles]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}
