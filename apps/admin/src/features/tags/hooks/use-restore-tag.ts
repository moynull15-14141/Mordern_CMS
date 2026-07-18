'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { tagsApi } from '../services/tags.api';
import { tagsKeys } from './query-keys';

/** `POST /tags/:id/restore` — reuses `category.create` (no `tag.restore`
 * permission exists). */
export function useRestoreTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsApi.restore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success('Tag restored.');
    },
  });
}
