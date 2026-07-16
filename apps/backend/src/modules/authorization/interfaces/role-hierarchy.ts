import { SystemRole } from './system-role.enum';

/**
 * Frozen role hierarchy (Milestone 5). A role inherits every permission of
 * the role(s) it points to, transitively — "Super Admin" implicitly has
 * everything "Administrator" has, which has everything "Editor" has, and so
 * on down to "Contributor". This is a pure code-level construct (no
 * `parentRoleId` column exists or is added — "Do NOT modify schema"); the
 * database only records which roles a user is directly assigned via
 * `UserRole`, and this map expands that into the effective set.
 *
 * Only the linear chain given in the milestone brief is modeled:
 *   Super Admin -> Administrator -> Editor -> Author -> Contributor
 * The other 6 system roles (Moderator, SEO Manager, Ads Manager, Analytics
 * Viewer, Subscriber, Guest) are standalone leaves with no inheritance —
 * the brief's hierarchy diagram only shows the one chain, so no inheritance
 * is invented for the rest.
 */
export const ROLE_HIERARCHY: Readonly<Record<string, readonly string[]>> = {
  [SystemRole.SUPER_ADMIN]: [SystemRole.ADMINISTRATOR],
  [SystemRole.ADMINISTRATOR]: [SystemRole.EDITOR],
  [SystemRole.EDITOR]: [SystemRole.AUTHOR],
  [SystemRole.AUTHOR]: [SystemRole.CONTRIBUTOR],
  [SystemRole.CONTRIBUTOR]: [],
  [SystemRole.MODERATOR]: [],
  [SystemRole.SEO_MANAGER]: [],
  [SystemRole.ADS_MANAGER]: [],
  [SystemRole.ANALYTICS_VIEWER]: [],
  [SystemRole.SUBSCRIBER]: [],
  [SystemRole.GUEST]: [],
};
