/**
 * Foundation only (Milestone 5) — interface, no implementation, no
 * business logic. A future business module would implement this per
 * entity to express rules that go beyond a flat permission string (e.g.
 * "an Author can update their OWN article, but not someone else's" — an
 * ownership check `hasPermission()` alone can't express).
 *
 * `actorRoles` is the caller's effective (direct + inherited) role set,
 * resolved via `AuthorizationService.resolveEffectiveRoles()`.
 */
export interface Policy<TSubject = unknown> {
  canView?(actorRoles: readonly string[], subject: TSubject): boolean;
  canCreate?(actorRoles: readonly string[]): boolean;
  canUpdate?(actorRoles: readonly string[], subject: TSubject): boolean;
  canDelete?(actorRoles: readonly string[], subject: TSubject): boolean;
}
