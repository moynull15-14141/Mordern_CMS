'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { pagesApi } from '../services/pages.api';
import { pagesKeys } from './query-keys';

/** `POST /pages/:id/restore` — `page.manage`-gated. */
export function useRestorePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pagesApi.restore(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: pagesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: pagesKeys.lists() });
      toast.success('Page restored.');
    },
  });
}
