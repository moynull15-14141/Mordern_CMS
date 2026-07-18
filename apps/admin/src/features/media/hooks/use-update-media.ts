'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { mediaApi } from '../services/media.api';
import type { UpdateMediaAssetInput } from '../types/media';
import { mediaKeys } from './query-keys';

/** `PATCH /media/:id` — altText/caption/credit/status only. Pessimistic:
 * no optimistic cache write. */
export function useUpdateMedia(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMediaAssetInput) => mediaApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success('Media updated.');
    },
  });
}
