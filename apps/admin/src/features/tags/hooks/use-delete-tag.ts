'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { tagsApi } from '../services/tags.api';
import { tagsKeys } from './query-keys';

/** `DELETE /tags/:id` — soft delete, rejected by the backend if the tag is
 * still used by articles. */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tagsApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: tagsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tagsKeys.lists() });
      toast.success('Tag deleted.');
    },
  });
}
