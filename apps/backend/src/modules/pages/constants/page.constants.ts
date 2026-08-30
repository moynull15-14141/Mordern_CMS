/**
 * Pages module. `ContentStatus` is the frozen Prisma enum
 * (`36_DATABASE_FREEZE.md`) — used directly, never re-declared here. This
 * file only holds module-local, code-level vocabulary that has no schema
 * equivalent. Mirrors `articles/constants/article.constants.ts`.
 */
export enum PageSortField {
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  PUBLISHED_AT = 'publishedAt',
  STATUS = 'status',
}

/** Status values reachable via the generic PATCH /pages/:id endpoint.
 * PUBLISHED is deliberately excluded — that transition requires
 * `page.manage` via the dedicated /pages/:id/publish endpoint instead,
 * mirroring Articles' publish-endpoint split. There is no SCHEDULED path
 * for Pages — the `Page` model has no `scheduledAt` column (see
 * docs/69_BACKEND_PAGES.md "Future Improvements"). */
export const GENERIC_UPDATE_ALLOWED_STATUSES = ['DRAFT', 'REVIEW', 'ARCHIVED'] as const;

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 200;
export const SLUG_MAX_UNIQUENESS_ATTEMPTS = 50;

/** Step 2 URL/SEO milestone — Pages are actually served under `/page/:slug`
 * (namespaced, per the app's real routing), so none of these collide with
 * a live route today; kept as defensive insurance against a future URL
 * architecture change (a bare-root page URL scheme) rather than a fix for
 * a collision that exists right now. */
export const RESERVED_PAGE_SLUGS = [
  'admin',
  'api',
  'sitemap',
  'sitemap.xml',
  'robots.txt',
  'preview',
  'studio',
  '_next',
] as const;
