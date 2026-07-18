import { resourceKeys } from '@/constants/query-keys';
import type { MediaFilters } from '../types/media';

const base = resourceKeys('media');

export const mediaKeys = {
  ...base,
  list: (filters: MediaFilters) => [...base.lists(), filters] as const,
  usages: (id: string) => ['media', id, 'usages'] as const,
  duplicates: (id: string) => ['media', id, 'duplicates'] as const,
};

export const mediaFolderKeys = {
  tree: () => ['media-folders', 'tree'] as const,
};
