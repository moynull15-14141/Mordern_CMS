import { ROLE_HIERARCHY } from '../interfaces/role-hierarchy';

/**
 * Expands a set of directly-assigned role names into the full effective
 * set (self + every transitively inherited role), per ROLE_HIERARCHY.
 * Never duplicates a role even if reachable through multiple paths (uses a
 * Set) and is safe against cycles (visited check) even though the frozen
 * hierarchy has none.
 */
export function resolveRoleHierarchy(roleNames: readonly string[]): string[] {
  const resolved = new Set<string>();

  const visit = (name: string): void => {
    if (resolved.has(name)) {
      return;
    }
    resolved.add(name);
    const inherited = ROLE_HIERARCHY[name] ?? [];
    for (const child of inherited) {
      visit(child);
    }
  };

  for (const name of roleNames) {
    visit(name);
  }

  return [...resolved];
}
