/**
 * Foundation only (Milestone 5) — interface, no implementation, no DI
 * binding. `AuthorizationService` reads permissions directly via
 * `RolePermissionRepository` today; this interface is a future pluggable
 * extension point (e.g. sourcing permissions from an external IdP instead
 * of the database) that nothing currently implements or injects.
 */
export interface PermissionProvider {
  getPermissionsForRole(roleName: string): Promise<string[]>;
}
