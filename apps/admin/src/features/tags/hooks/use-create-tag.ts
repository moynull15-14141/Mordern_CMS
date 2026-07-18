'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { tagsApi } from '../services/tags.api';
import type { CreateTagInput } from '../types/tag';
import { tagsKeys } from './query-keys';

/** `POST /tags` — reuses `category.create` (no `tag.*` permission exists). */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTagInput) => tagsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success('Tag created.');
    },
  });
}
