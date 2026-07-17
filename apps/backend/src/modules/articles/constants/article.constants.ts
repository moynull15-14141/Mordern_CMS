/**
 * Articles Foundation (Milestone 8). `ContentStatus`/`ArticleVisibility` are
 * the frozen Prisma enums (`36_DATABASE_FREEZE.md`) — used directly, never
 * re-declared here. This file only holds module-local, code-level
 * vocabulary that has no schema equivalent.
 */
export enum ArticleSortField {
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  PUBLISHED_AT = 'publishedAt',
  STATUS = 'status',
}

/** Status values reachable via the generic PATCH /articles/:id endpoint.
 * PUBLISHED and SCHEDULED are deliberately excluded — those transitions
 * require the `article.publish` permission via the dedicated
 * /articles/:id/publish and /articles/:id/schedule endpoints instead (see
 * docs/46_ARTICLES_ARCHITECTURE.md "Status Flow"). */
export const GENERIC_UPDATE_ALLOWED_STATUSES = ['DRAFT', 'REVIEW', 'ARCHIVED'] as const;

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 200;
export const SLUG_MAX_UNIQUENESS_ATTEMPTS = 50;
