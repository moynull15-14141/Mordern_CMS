'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import { reusableBlocksKeys } from './query-keys';

/** `POST /content-blocks/reusable/:id/restore` — `page.manage`-gated. */
export function useRestoreReusableBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reusableBlocksApi.restore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: reusableBlocksKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reusableBlocksKeys.lists() });
      toast.success('Reusable block restored.');
    },
  });
}
