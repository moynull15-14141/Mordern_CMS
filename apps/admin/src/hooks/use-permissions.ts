'use client';

import { useContext } from 'react';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

/** The single cached source every guard reads from —
 * docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Permission Flow". */
export function usePermissions(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions() must be used within a <PermissionProvider>.');
  }
  return context;
}
