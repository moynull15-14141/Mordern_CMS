import type { PermissionKey } from '@/constants/permissions';

/** Pure permission-evaluation helpers, consumed by usePermissions()/guards
 * (docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Permission Flow"). Never the
 * source of truth — the backend independently re-checks every request
 * (docs/55_FRONTEND_HANDOFF.md). */

export function hasPermission(granted: readonly string[], required: PermissionKey): boolean {
  return granted.includes(required);
}

/** OR semantics — matches the backend's RequireAnyPermission decorator. */
export function hasAnyPermission(
  granted: readonly string[],
  required: readonly PermissionKey[]
): boolean {
  if (required.length === 0) return true;
  return required.some((permission) => granted.includes(permission));
}

/** AND semantics — matches the backend's RequireAllPermissions decorator. */
export function hasAllPermissions(
  granted: readonly string[],
  required: readonly PermissionKey[]
): boolean {
  if (required.length === 0) return true;
  return required.every((permission) => granted.includes(permission));
}

export function hasRole(roles: readonly string[], required: string): boolean {
  return roles.includes(required);
}
