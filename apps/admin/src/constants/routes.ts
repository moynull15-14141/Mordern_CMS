/** Frontend route path constants — mirrors the route structure frozen in
 * docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "App Router — Route Structure".
 * Infrastructure only: these routes are not yet implemented as pages in
 * Frontend Milestone 1 (foundation only, no business pages) — the
 * constants exist so route guards / nav config / redirects never
 * hand-write a path string. */
export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  ARTICLES: '/articles',
  CATEGORIES: '/categories',
  TAGS: '/tags',
  MEDIA: '/media',
  COMMENTS: '/comments',
  SEO: '/seo',
  USERS: '/users',
  ROLES: '/roles',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  ACTIVITY_LOGS: '/activity-logs',
  SYSTEM: '/system',
  FORBIDDEN: '/403',
  NOT_FOUND: '/404',
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];

/** Frontend Milestone 3 — id-scoped path builders, additive to `ROUTES`
 * (which stays flat strings so existing call sites — nav config, header
 * link — are unaffected). */
export const USER_ROUTES = {
  new: () => `${ROUTES.USERS}/new`,
  detail: (id: string) => `${ROUTES.USERS}/${id}`,
  edit: (id: string) => `${ROUTES.USERS}/${id}/edit`,
};

export const PROFILE_ROUTES = {
  edit: () => `${ROUTES.PROFILE}/edit`,
  changePassword: () => `${ROUTES.PROFILE}/change-password`,
};

/** Frontend Milestone 4 — docs/56 freezes only `settings/[category]/page.tsx`
 * in its route tree (unlike every other module, it does not separately list
 * a bare `settings/page.tsx`). The flat `/settings` route already exists in
 * the app (nav-linked, scaffolded in an earlier milestone) and is reused
 * as-is for the overview — see docs/64_FRONTEND_SETTINGS.md "Conflicts
 * Discovered". */
export const SETTINGS_ROUTES = {
  category: (category: string) => `${ROUTES.SETTINGS}/${category}`,
};

/** Frontend Milestone 5 — id-scoped path builders, additive to `ROUTES`. */
export const ARTICLE_ROUTES = {
  new: () => `${ROUTES.ARTICLES}/new`,
  detail: (id: string) => `${ROUTES.ARTICLES}/${id}`,
  edit: (id: string) => `${ROUTES.ARTICLES}/${id}/edit`,
};

/** Frontend Milestone 6 — id-scoped path builders, additive to `ROUTES`. */
export const CATEGORY_ROUTES = {
  new: () => `${ROUTES.CATEGORIES}/new`,
  detail: (id: string) => `${ROUTES.CATEGORIES}/${id}`,
  edit: (id: string) => `${ROUTES.CATEGORIES}/${id}/edit`,
};

export const TAG_ROUTES = {
  new: () => `${ROUTES.TAGS}/new`,
  detail: (id: string) => `${ROUTES.TAGS}/${id}`,
  edit: (id: string) => `${ROUTES.TAGS}/${id}/edit`,
};

/** Frontend Milestone 7 — id-scoped path builders, additive to `ROUTES`.
 * No `/media/[id]/edit` route — this milestone's brief lists only
 * `/media`, `/media/upload`, `/media/[id]`; metadata editing happens
 * inline on the Detail page. */
export const MEDIA_ROUTES = {
  upload: () => `${ROUTES.MEDIA}/upload`,
  detail: (id: string) => `${ROUTES.MEDIA}/${id}`,
};

/** Routes reachable without authentication — GuestRoute redirects an
 * already-authenticated user away from these (docs/56 Layout System's
 * Authentication Layout). */
export const PUBLIC_ROUTES: RouteValue[] = [
  ROUTES.LOGIN,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];
