import type { ReusableBlockContentType, ReusableBlockSortField } from '../types/reusable-block';

export const REUSABLE_BLOCKS_DEFAULT_PAGE_SIZE = 20;

export const SORT_FIELD_LABELS: Record<ReusableBlockSortField, string> = {
  name: 'Name',
  createdAt: 'Created',
  updatedAt: 'Updated',
};

/** Only Page and Article exist as content types in this codebase today —
 * "Landing Pages"/"Templates" aren't real content types yet, so usage
 * scanning (and this label map) only ever needs these two. */
export const CONTENT_TYPE_LABELS: Record<ReusableBlockContentType, string> = {
  page: 'Page',
  article: 'Article',
};
