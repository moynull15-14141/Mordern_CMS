/**
 * Foundation only (Milestone 5) — interface, no implementation, no DI
 * binding. `AuthorizationService` reads roles directly via
 * `UserRoleRepository` today; this is a future pluggable extension point.
 */
export interface RoleProvider {
  getRolesForUser(userId: string): Promise<string[]>;
}
