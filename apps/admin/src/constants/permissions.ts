/**
 * Frontend mirror of the backend's PERMISSIONS vocabulary —
 * apps/backend/src/modules/authorization/interfaces/permission.constants.ts,
 * docs/38_RBAC_ARCHITECTURE.md. The frozen V1 list is 21 keys; `LAYOUT_MANAGE`
 * was added here only because it was added to that same backend constant
 * first, for Backend Milestone 14.1 — this file still only ever mirrors
 * the backend, never leads it. Never referenced as a hand-typed string
 * literal at a call site — this is
 * the ONE place a permission string may be written (docs/60_ADMIN_NAVIGATION.md
 * "Architecture"). Adding a permission here without a corresponding backend
 * change would violate the frozen API/permission contract (docs/53_API_FREEZE.md)
 * — this file must only ever mirror the backend, never lead it.
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

/** Frozen 11 system roles — docs/38_RBAC_ARCHITECTURE.md. Informational
 * only on the frontend (role -> permission resolution always happens
 * server-side); used for display purposes (e.g. a user's role badge). */
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMINISTRATOR: 'Administrator',
  EDITOR: 'Editor',
  AUTHOR: 'Author',
  CONTRIBUTOR: 'Contributor',
  MODERATOR: 'Moderator',
  SEO_MANAGER: 'SEO Manager',
  ADS_MANAGER: 'Ads Manager',
  ANALYTICS_VIEWER: 'Analytics Viewer',
  SUBSCRIBER: 'Subscriber',
  GUEST: 'Guest',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];
