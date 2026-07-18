import type { ContentStatus, GenericUpdateStatus, PageSortField } from '../types/page';

export const PAGES_DEFAULT_PAGE_SIZE = 20;

/** All 6 real `ContentStatus` values — display label only, verified against
 * `@prisma/client`'s frozen enum (same enum Articles uses). `SCHEDULED` is
 * listed for completeness (the shared enum includes it) even though Pages
 * has no code path that ever sets it (no `/pages/:id/schedule` endpoint). */
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

/** Statuses settable via the generic `PATCH /pages/:id` — PUBLISHED is
 * excluded (requires `/publish`), matching the backend's own
 * `GENERIC_UPDATE_ALLOWED_STATUSES`. */
export const GENERIC_UPDATE_STATUS_OPTIONS: { value: GenericUpdateStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REVIEW', label: 'In Review' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const SORT_FIELD_LABELS: Record<PageSortField, string> = {
  title: 'Title',
  createdAt: 'Created',
  updatedAt: 'Updated',
  publishedAt: 'Published',
  status: 'Status',
};
