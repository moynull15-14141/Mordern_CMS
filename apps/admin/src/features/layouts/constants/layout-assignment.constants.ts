import type { LayoutAssignmentContentType } from '../types/layout-assignment';

export const CONTENT_TYPE_LABELS: Record<LayoutAssignmentContentType, string> = {
  HOMEPAGE: 'Homepage',
  PAGE: 'Page',
  ARTICLE: 'Article',
  CATEGORY: 'Category',
};

export const CONTENT_TYPE_OPTIONS: { value: LayoutAssignmentContentType; label: string }[] = (
  Object.keys(CONTENT_TYPE_LABELS) as LayoutAssignmentContentType[]
).map((value) => ({ value, label: CONTENT_TYPE_LABELS[value] }));
