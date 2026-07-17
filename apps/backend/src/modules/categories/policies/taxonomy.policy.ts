import { Policy } from '../../authorization/policies/policy.interface';
import { SystemRole } from '../../authorization/interfaces/system-role.enum';

/** Neither `Category` nor `Tag` has an author/owner-equivalent field
 * (unlike `Article` — see docs/47_CATEGORY_TAG_ARCHITECTURE.md "Permission
 * Flow"), so there is nothing to compare against; `subject` only carries
 * `siteId` for a possible future site-scoped rule, unused today. */
export interface TaxonomyPolicySubject {
  siteId: string;
}

const TAXONOMY_MANAGER_ROLES: readonly string[] = [
  SystemRole.SUPER_ADMIN,
  SystemRole.ADMINISTRATOR,
  SystemRole.EDITOR,
];

/**
 * Shared by both Category and Tag (the same role tier manages both taxonomy
 * types) — first concrete `Policy<TSubject>` implementation for taxonomy,
 * providing role-based defense-in-depth on top of the flat `category.create`
 * permission check already enforced by `PermissionGuard` (no new permission
 * — see docs/47_CATEGORY_TAG_ARCHITECTURE.md "Permission Flow").
 */
export class TaxonomyPolicy implements Policy<TaxonomyPolicySubject> {
  canCreate(actorRoles: readonly string[]): boolean {
    return TAXONOMY_MANAGER_ROLES.some((role) => actorRoles.includes(role));
  }

  canUpdate(actorRoles: readonly string[], _subject: TaxonomyPolicySubject): boolean {
    return TAXONOMY_MANAGER_ROLES.some((role) => actorRoles.includes(role));
  }

  canDelete(actorRoles: readonly string[], _subject: TaxonomyPolicySubject): boolean {
    return TAXONOMY_MANAGER_ROLES.some((role) => actorRoles.includes(role));
  }
}
