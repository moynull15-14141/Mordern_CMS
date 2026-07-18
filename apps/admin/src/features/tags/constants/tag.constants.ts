import type { TagSortField } from '../types/tag';

export const TAGS_DEFAULT_PAGE_SIZE = 20;

export const SORT_FIELD_LABELS: Record<TagSortField, string> = {
  name: 'Name',
  slug: 'Slug',
  createdAt: 'Created',
  updatedAt: 'Updated',
};
