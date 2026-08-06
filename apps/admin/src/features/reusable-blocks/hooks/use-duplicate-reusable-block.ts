'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { isApiError } from '@/lib/api-error';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import type { ReusableBlock } from '../types/reusable-block';
import { reusableBlocksKeys } from './query-keys';

/** No dedicated backend endpoint — composes `create` from an in-memory
 * source block (`reusableBlocksApi.duplicate`). Toasts on error since name
 * conflicts are a realistic, user-actionable failure here (the default
 * "(copy)" suffix collides if duplicated twice in a row without editing
 * the name). */
export function useDuplicateReusableBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ source, name }: { source: ReusableBlock; name: string }) =>
      reusableBlocksApi.duplicate(source, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reusableBlocksKeys.lists() });
      toast.success('Reusable block duplicated.');
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Could not duplicate this reusable block.');
    },
  });
}
