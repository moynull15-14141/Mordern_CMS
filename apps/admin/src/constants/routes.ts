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

/** Routes reachable without authentication — GuestRoute redirects an
 * already-authenticated user away from these (docs/56 Layout System's
 * Authentication Layout). */
export const PUBLIC_ROUTES: RouteValue[] = [
  ROUTES.LOGIN,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];
