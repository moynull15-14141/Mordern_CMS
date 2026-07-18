import type { CategorySortField, CategoryStatus } from '../types/category';

export const CATEGORIES_DEFAULT_PAGE_SIZE = 20;

/** Both real `CategoryStatus` values (`@prisma/client`, ACTIVE|INACTIVE only). */
export const STATUS_LABELS: Record<CategoryStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const STATUS_OPTIONS: { value: CategoryStatus; label: string }[] = (
  Object.keys(STATUS_LABELS) as CategoryStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));

export const STATUS_BADGE_VARIANT: Record<CategoryStatus, 'success' | 'secondary'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
};

export const SORT_FIELD_LABELS: Record<CategorySortField, string> = {
  name: 'Name',
  slug: 'Slug',
  sortOrder: 'Sort order',
  createdAt: 'Created',
  updatedAt: 'Updated',
};
