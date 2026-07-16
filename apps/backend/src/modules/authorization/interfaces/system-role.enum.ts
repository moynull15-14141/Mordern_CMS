/**
 * Frozen default system roles (Milestone 5). Values match `Role.name`
 * exactly — these are the strings that will exist as `Role` rows once a
 * future Users/Roles module seeds them; this module works correctly
 * whether or not that data exists yet (an unassigned user simply resolves
 * to zero roles/permissions).
 *
 * No UI, no CRUD, no custom roles yet — "Future versions may create custom
 * roles" per the milestone brief; this enum only covers the frozen set.
 */
export enum SystemRole {
  SUPER_ADMIN = 'Super Admin',
  ADMINISTRATOR = 'Administrator',
  EDITOR = 'Editor',
  AUTHOR = 'Author',
  CONTRIBUTOR = 'Contributor',
  MODERATOR = 'Moderator',
  SEO_MANAGER = 'SEO Manager',
  ADS_MANAGER = 'Ads Manager',
  ANALYTICS_VIEWER = 'Analytics Viewer',
  SUBSCRIBER = 'Subscriber',
  GUEST = 'Guest',
}
