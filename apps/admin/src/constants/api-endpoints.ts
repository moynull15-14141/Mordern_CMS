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
  SETTINGS: '/settings',
  USERS: '/users',
  ARTICLES: '/articles',
  CATEGORIES: '/categories',
  TAGS: '/tags',
  MEDIA: '/media',
  MEDIA_FOLDERS: '/media-folders',
  COMMENTS: '/comments',
  SEO: '/seo',
  HEALTH: '/health',
} as const;
