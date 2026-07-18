'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { pagesApi } from '../services/pages.api';
import type { UpdatePageInput } from '../types/page';
import { pagesKeys } from './query-keys';

/** `PATCH /pages/:id` — `page.manage`-gated. Pessimistic (mirrors
 * `useUpdateArticle`): no optimistic cache write. */
export function useUpdatePage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePageInput) => pagesApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: pagesKeys.lists() });
      toast.success('Page updated.');
    },
  });
}
