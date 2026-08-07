/**
 * Path constants mirroring the backend's frozen route surface —
 * docs/53_API_FREEZE.md "Endpoint Count" table. Infrastructure only — no
 * business module calls these yet (Frontend Milestone 1 forbids CRUD/API
 * calls); this file exists so a future feature's service layer never
 * hand-writes a path string. Every prefix listed matches the live-verified
 * 93-path / 120-operation surface exactly — no invented endpoint.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },
  AUTHORIZATION: {
    ME: '/authorization/me',
  },
  /** Frontend Milestone 4 — sub-paths verified directly against
   * `apps/backend/src/modules/settings/controllers/settings.controller.ts`.
   * No `/settings/:id` (create), no `DELETE` (no such capability exists —
   * see docs/64_FRONTEND_SETTINGS.md "Conflicts Discovered"). Import/export
   * paths are real but unused — out of this milestone's requested scope. */
  SETTINGS: {
    ROOT: '/settings',
    EXPORT: '/settings/export',
    IMPORT: '/settings/import',
    RESET: '/settings/reset',
    RESET_CATEGORY: '/settings/reset/category',
    byCategory: (category: string) => `/settings/category/${category}`,
    byKey: (key: string) => `/settings/${key}`,
  },
  /** Frontend Milestone 3 — sub-paths verified directly against
   * `apps/backend/src/modules/users/controllers/users.controller.ts`, not
   * assumed from docs (see docs/63_FRONTEND_USERS.md "API Mapping" for the
   * endpoints that do NOT exist despite being named in an earlier milestone
   * brief — role assignment, `/users/profile`, `PATCH /users/:id/password`). */
  USERS: {
    ROOT: '/users',
    ME: '/users/me',
    ME_PROFILE: '/users/me/profile',
    ME_PREFERENCES: '/users/me/preferences',
    ME_AVATAR: '/users/me/avatar',
    byId: (id: string) => `/users/${id}`,
    restore: (id: string) => `/users/${id}/restore`,
    changePassword: (id: string) => `/users/${id}/change-password`,
    resetPassword: (id: string) => `/users/${id}/reset-password`,
    sessions: (id: string) => `/users/${id}/sessions`,
    session: (id: string, sessionId: string) => `/users/${id}/sessions/${sessionId}`,
  },
  /** Frontend Milestone 5 — sub-paths verified directly against
   * `apps/backend/src/modules/articles/controllers/articles.controller.ts`.
   * No bulk endpoint exists; no `article.view` permission exists (reads use
   * `RequireAnyPermission` across the 4 real article permissions instead —
   * see docs/65_FRONTEND_ARTICLES.md). */
  ARTICLES: {
    ROOT: '/articles',
    bySlug: (slug: string) => `/articles/slug/${slug}`,
    byId: (id: string) => `/articles/${id}`,
    restore: (id: string) => `/articles/${id}/restore`,
    publish: (id: string) => `/articles/${id}/publish`,
    schedule: (id: string) => `/articles/${id}/schedule`,
    revisions: (id: string) => `/articles/${id}/revisions`,
    revisionsCompare: (id: string) => `/articles/${id}/revisions/compare`,
    restoreRevision: (id: string, version: number) =>
      `/articles/${id}/revisions/${version}/restore`,
  },
  /** Frontend Milestone 6 — sub-paths verified directly against
   * `apps/backend/src/modules/categories/controllers/categories.controller.ts`.
   * `FLAT` was already added in Frontend Milestone 5 for the Articles
   * selector — reused as-is here for the parent-category picker. */
  CATEGORIES: {
    ROOT: '/categories',
    TREE: '/categories/tree',
    FLAT: '/categories/flat',
    bySlug: (slug: string) => `/categories/slug/${slug}`,
    byId: (id: string) => `/categories/${id}`,
    move: (id: string) => `/categories/${id}/move`,
    restore: (id: string) => `/categories/${id}/restore`,
    children: (id: string) => `/categories/${id}/children`,
    descendants: (id: string) => `/categories/${id}/descendants`,
    ancestors: (id: string) => `/categories/${id}/ancestors`,
    breadcrumb: (id: string) => `/categories/${id}/breadcrumb`,
  },
  /** Frontend Milestone 6 — sub-paths verified directly against
   * `apps/backend/src/modules/categories/controllers/tags.controller.ts`. */
  TAGS: {
    ROOT: '/tags',
    bySlug: (slug: string) => `/tags/slug/${slug}`,
    byId: (id: string) => `/tags/${id}`,
    restore: (id: string) => `/tags/${id}/restore`,
  },
  /** Frontend Milestone 7 (`POST /media` metadata registration) + Milestone
   * 5 (Enterprise Digital Asset Platform — real presigned-upload/bulk/
   * favorites endpoints), verified directly against
   * `apps/backend/src/modules/media/controllers/*.controller.ts`. */
  MEDIA: {
    ROOT: '/media',
    byId: (id: string) => `/media/${id}`,
    usages: (id: string) => `/media/${id}/usages`,
    duplicates: (id: string) => `/media/${id}/duplicates`,
    rename: (id: string) => `/media/${id}/rename`,
    move: (id: string) => `/media/${id}/move`,
    copyMetadata: (id: string) => `/media/${id}/copy-metadata`,
    restore: (id: string) => `/media/${id}/restore`,
    signedUrl: (id: string) => `/media/${id}/signed-url`,
    uploadRequests: '/media/upload-requests',
    uploadRequestsMultipart: '/media/upload-requests/multipart',
    multipartComplete: (id: string) => `/media/upload-requests/${id}/multipart/complete`,
    multipartAbort: (id: string) => `/media/upload-requests/${id}/multipart/abort`,
    confirmUpload: (id: string) => `/media/${id}/confirm-upload`,
    bulkMove: '/media/bulk/move',
    bulkArchive: '/media/bulk/archive',
    bulkUnarchive: '/media/bulk/unarchive',
    bulkRestore: '/media/bulk/restore',
    bulkDelete: '/media/bulk/delete',
    permanentDelete: (id: string) => `/media/bulk/${id}/permanent`,
    favorites: '/media/favorites',
    favorite: (id: string) => `/media/${id}/favorite`,
    recent: '/media/recent',
    recordView: (id: string) => `/media/${id}/view`,
    pinned: '/media/pinned',
    pin: (id: string) => `/media/${id}/pin`,
  },
  /** Frontend Milestone 7 — only the sub-path the folder filter/picker
   * needs (`tree`); full Folder CRUD is out of this milestone's requested
   * pages (see docs/67_FRONTEND_MEDIA.md "Known Limitations"). */
  MEDIA_FOLDERS: {
    ROOT: '/media-folders',
    TREE: '/media-folders/tree',
  },
  COMMENTS: '/comments',
  /** Frontend Milestone 9 — sub-paths verified directly against
   * `apps/backend/src/modules/seo/controllers/seo.controller.ts`. No
   * `GET /seo` list endpoint exists — only lookup by id/article/category. */
  SEO: {
    ROOT: '/seo',
    UPSERT: '/seo/upsert',
    PREVIEW: '/seo/preview',
    VALIDATE: '/seo/validate',
    byId: (id: string) => `/seo/${id}`,
    byArticle: (articleId: string) => `/seo/article/${articleId}`,
    byCategory: (categoryId: string) => `/seo/category/${categoryId}`,
    restore: (id: string) => `/seo/${id}/restore`,
  },
  /** Frontend Milestone 10 — sub-paths verified directly against
   * `apps/backend/src/modules/pages/controllers/pages.controller.ts`. No
   * `/schedule` endpoint, no hierarchy sub-paths — `Page` has no
   * `scheduledAt`/`parentId` column. */
  PAGES: {
    ROOT: '/pages',
    bySlug: (slug: string) => `/pages/slug/${slug}`,
    byId: (id: string) => `/pages/${id}`,
    restore: (id: string) => `/pages/${id}/restore`,
    publish: (id: string) => `/pages/${id}/publish`,
    previewToken: (id: string) => `/pages/${id}/preview-token`,
  },
  /** Frontend Milestone 12 — sub-paths verified directly against
   * `apps/backend/src/modules/themes/controllers/themes.controller.ts`. No
   * `bySlug` lookup exists on this controller (unlike Pages/Menus/
   * Articles) — only `GET /themes/:id`. */
  THEMES: {
    ROOT: '/themes',
    ACTIVE: '/themes/active',
    byId: (id: string) => `/themes/${id}`,
    restore: (id: string) => `/themes/${id}/restore`,
    activate: (id: string) => `/themes/${id}/activate`,
  },
  /** Backend Milestone 14.1 — sub-paths verified directly against
   * `apps/backend/src/modules/layouts/controllers/layouts.controller.ts`
   * and `layout-assignments.controller.ts`. No `bySlug` lookup on
   * `LayoutsController` (mirrors Themes, not Pages/Articles). */
  LAYOUTS: {
    ROOT: '/layouts',
    byId: (id: string) => `/layouts/${id}`,
    restore: (id: string) => `/layouts/${id}/restore`,
  },
  LAYOUT_ASSIGNMENTS: {
    ROOT: '/layout-assignments',
    byId: (id: string) => `/layout-assignments/${id}`,
    restore: (id: string) => `/layout-assignments/${id}/restore`,
  },
  /** Rich Content Engine (Phase 1 / Step 1, Milestone 3) — sub-paths
   * verified directly against
   * `apps/backend/src/modules/content-blocks/controllers/reusable-blocks.controller.ts`.
   * Gated by the `page.manage` permission (reused, not a dedicated
   * permission — see that controller's own doc comment). */
  CONTENT_BLOCKS: {
    REUSABLE_ROOT: '/content-blocks/reusable',
    reusableById: (id: string) => `/content-blocks/reusable/${id}`,
    reusableRestore: (id: string) => `/content-blocks/reusable/${id}/restore`,
    reusableUsages: (id: string) => `/content-blocks/reusable/${id}/usages`,
  },
  /** Section & Pattern Library — verified directly against
   * `apps/backend/src/modules/patterns/controllers/*.controller.ts`. */
  PATTERNS: {
    ROOT: '/patterns',
    byId: (id: string) => `/patterns/${id}`,
    duplicate: (id: string) => `/patterns/${id}/duplicate`,
    archive: (id: string) => `/patterns/${id}/archive`,
    unarchive: (id: string) => `/patterns/${id}/unarchive`,
    restore: (id: string) => `/patterns/${id}/restore`,
    usages: (id: string) => `/patterns/${id}/usages`,
    favorites: '/patterns/favorites',
    favorite: (id: string) => `/patterns/${id}/favorite`,
  },
  HEALTH: '/health',
} as const;
