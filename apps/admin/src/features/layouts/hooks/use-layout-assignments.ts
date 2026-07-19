'use client';

import { useQuery } from '@tanstack/react-query';
import { layoutAssignmentsApi } from '../services/layout-assignments.api';
import type { LayoutAssignmentContentType } from '../types/layout-assignment';
import { layoutAssignmentsKeys } from './query-keys';

/** `GET /layout-assignments[?contentType=]` — `layout.manage`-gated, not
 * paginated (see `layoutAssignmentsApi.list`'s doc comment). */
export function useLayoutAssignments(contentType?: LayoutAssignmentContentType) {
  return useQuery({
    queryKey: layoutAssignmentsKeys.list(contentType),
    queryFn: () => layoutAssignmentsApi.list(contentType),
  });
}
