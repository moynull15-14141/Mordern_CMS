import type { ArticleSortField, ArticleVisibility, ContentStatus, GenericUpdateStatus } from '../types/article';

export const ARTICLES_DEFAULT_PAGE_SIZE = 20;

/** All 6 real `ContentStatus` values — display label only, verified against
 * `@prisma/client`'s frozen enum. */
export const STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: 'Draft',
  REVIEW: 'In Review',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
  DELETED: 'Deleted',
};

export const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = (
  Object.keys(STATUS_LABELS) as ContentStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));

export const STATUS_BADGE_VARIANT: Record<
  ContentStatus,
  'success' | 'secondary' | 'warning' | 'info' | 'outline' | 'destructive'
> = {
  DRAFT: 'secondary',
  REVIEW: 'warning',
  SCHEDULED: 'info',
  PUBLISHED: 'success',
  ARCHIVED: 'outline',
  DELETED: 'destructive',
};

/** Statuses settable via the generic `PATCH /articles/:id` — PUBLISHED and
 * SCHEDULED are excluded (require `/publish`/`/schedule`), matching the
 * backend's own `GENERIC_UPDATE_ALLOWED_STATUSES`. */
export const GENERIC_UPDATE_STATUS_OPTIONS: { value: GenericUpdateStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REVIEW', label: 'In Review' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const VISIBILITY_LABELS: Record<ArticleVisibility, string> = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
  UNLISTED: 'Unlisted',
};

export const VISIBILITY_OPTIONS: { value: ArticleVisibility; label: string }[] = (
  Object.keys(VISIBILITY_LABELS) as ArticleVisibility[]
).map((value) => ({ value, label: VISIBILITY_LABELS[value] }));

export const SORT_FIELD_LABELS: Record<ArticleSortField, string> = {
  title: 'Title',
  createdAt: 'Created',
  updatedAt: 'Updated',
  publishedAt: 'Published',
  status: 'Status',
};
