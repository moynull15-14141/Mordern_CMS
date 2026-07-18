import { resourceKeys } from '@/constants/query-keys';
import type { TagFilters } from '../types/tag';

const base = resourceKeys('tags');

export const tagsKeys = {
  ...base,
  list: (filters: TagFilters) => [...base.lists(), filters] as const,
};
