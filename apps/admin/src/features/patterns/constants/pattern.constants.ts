import type { PatternSortField, PatternUsageContentType } from '../types/pattern';

export const PATTERNS_DEFAULT_PAGE_SIZE = 20;

export const SORT_FIELD_LABELS: Record<PatternSortField, string> = {
  name: 'Name',
  createdAt: 'Created',
  updatedAt: 'Updated',
};

export const CONTENT_TYPE_LABELS: Record<PatternUsageContentType, string> = {
  page: 'Page',
  article: 'Article',
  'reusable-block': 'Reusable Block',
};
