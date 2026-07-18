'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { pagesApi } from '../services/pages.api';
import { pagesKeys } from './query-keys';

/** `POST /pages/:id/publish` — `page.manage`-gated, publishes immediately.
 * No `/schedule` counterpart exists (no `scheduledAt` column on `Page`). */
export function usePublishPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pagesApi.publish(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: pagesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: pagesKeys.lists() });
      toast.success('Page published.');
    },
  });
}
