/**
 * Frozen permission keys (Milestone 5). Format is always `resource.action`
 * — never numeric. This is the exhaustive V1 list from the milestone brief;
 * adding a new permission means adding a new entry here (and updating
 * `38_RBAC_ARCHITECTURE.md`), never inventing an ad-hoc string at a call site.
 */
export const PERMISSIONS = {
  ARTICLE_CREATE: 'article.create',
  ARTICLE_UPDATE: 'article.update',
  ARTICLE_DELETE: 'article.delete',
  ARTICLE_PUBLISH: 'article.publish',
  CATEGORY_CREATE: 'category.create',
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',
  SEO_MANAGE: 'seo.manage',
  COMMENT_MODERATE: 'comment.moderate',
  SETTINGS_MANAGE: 'settings.manage',
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  PERMISSIONS_MANAGE: 'permissions.manage',
  DASHBOARD_VIEW: 'dashboard.view',
  ANALYTICS_VIEW: 'analytics.view',
  MENU_MANAGE: 'menu.manage',
  PAGE_MANAGE: 'page.manage',
  THEME_MANAGE: 'theme.manage',
  LAYOUT_MANAGE: 'layout.manage',
  ADS_MANAGE: 'ads.manage',
  API_MANAGE: 'api.manage',
  SYSTEM_MANAGE: 'system.manage',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Builds a `resource.action` string — the only way a permission key should
 * ever be constructed dynamically, so the format stays consistent. */
export function buildPermissionKey(resource: string, action: string): string {
  return `${resource}.${action}`;
}
