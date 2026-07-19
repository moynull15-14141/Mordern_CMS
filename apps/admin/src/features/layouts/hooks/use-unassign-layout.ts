'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { layoutAssignmentsApi } from '../services/layout-assignments.api';
import { layoutAssignmentsKeys } from './query-keys';

/** `DELETE /layout-assignments/:id` — soft delete ("unassign"),
 * `layout.manage`-gated. */
export function useUnassignLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => layoutAssignmentsApi.unassign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layoutAssignmentsKeys.lists() });
      toast.success('Layout unassigned.');
    },
  });
}
