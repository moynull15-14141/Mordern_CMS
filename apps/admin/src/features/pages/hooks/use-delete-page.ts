'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { pagesApi } from '../services/pages.api';
import { pagesKeys } from './query-keys';

/** `DELETE /pages/:id` — soft delete, `page.manage`-gated. */
export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pagesApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: pagesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: pagesKeys.lists() });
      toast.success('Page deleted.');
    },
  });
}
