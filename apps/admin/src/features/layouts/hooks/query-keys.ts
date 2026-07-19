import { resourceKeys } from '@/constants/query-keys';
import type { LayoutFilters } from '../types/layout';
import type { LayoutAssignmentContentType } from '../types/layout-assignment';

const base = resourceKeys('layouts');

export const layoutsKeys = {
  ...base,
  list: (filters: LayoutFilters) => [...base.lists(), filters] as const,
};

const assignmentBase = resourceKeys('layout-assignments');

export const layoutAssignmentsKeys = {
  ...assignmentBase,
  list: (contentType?: LayoutAssignmentContentType) =>
    [...assignmentBase.lists(), contentType] as const,
};
