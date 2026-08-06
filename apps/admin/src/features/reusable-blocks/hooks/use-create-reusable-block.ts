'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import type { CreateReusableBlockInput } from '../types/reusable-block';
import { reusableBlocksKeys } from './query-keys';

/** `POST /content-blocks/reusable` — `page.manage`-gated. */
export function useCreateReusableBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReusableBlockInput) => reusableBlocksApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reusableBlocksKeys.lists() });
      toast.success('Reusable block created.');
    },
  });
}
