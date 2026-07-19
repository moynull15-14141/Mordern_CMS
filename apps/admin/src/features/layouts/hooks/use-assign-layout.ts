'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { layoutAssignmentsApi } from '../services/layout-assignments.api';
import type { AssignLayoutInput } from '../types/layout-assignment';
import { layoutAssignmentsKeys } from './query-keys';

/** `POST /layout-assignments` — upsert, `layout.manage`-gated. Invalidates
 * every assignments list regardless of `contentType` filter (the exact
 * filter this mutation affects isn't known client-side without
 * re-deriving it, and assignment lists are small/cheap to refetch). */
export function useAssignLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignLayoutInput) => layoutAssignmentsApi.assign(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layoutAssignmentsKeys.lists() });
      toast.success('Layout assigned.');
    },
  });
}
