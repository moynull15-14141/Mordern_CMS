import { resourceKeys } from '@/constants/query-keys';
import type { ArticleFilters } from '../types/article';

const base = resourceKeys('articles');

export const articlesKeys = {
  ...base,
  list: (filters: ArticleFilters) => [...base.lists(), filters] as const,
  revisions: (id: string) => ['articles', id, 'revisions'] as const,
};

/** Selector-only keys — see `categories.api.ts`/`tags.api.ts`/`media.api.ts`. */
export const categoryOptionsKeys = {
  flat: () => ['articles', 'category-options'] as const,
};

export const tagOptionsKeys = {
  list: (search?: string) => ['articles', 'tag-options', search ?? ''] as const,
};

export const mediaOptionsKeys = {
  list: (search?: string) => ['articles', 'media-options', search ?? ''] as const,
};
