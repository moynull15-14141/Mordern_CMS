'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { tagsApi } from '../services/tags.api';
import type { UpdateTagInput } from '../types/tag';
import { tagsKeys } from './query-keys';

/** `PATCH /tags/:id` — pessimistic, no optimistic cache write. */
export function useUpdateTag(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTagInput) => tagsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success('Tag updated.');
    },
  });
}
