'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import type { UpdateReusableBlockInput } from '../types/reusable-block';
import { reusableBlocksKeys } from './query-keys';

/** `PATCH /content-blocks/reusable/:id` — `page.manage`-gated. Pessimistic
 * (mirrors `useUpdateTheme`): no optimistic cache write. */
export function useUpdateReusableBlock(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateReusableBlockInput) => reusableBlocksApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reusableBlocksKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reusableBlocksKeys.lists() });
      toast.success('Reusable block updated.');
    },
  });
}
