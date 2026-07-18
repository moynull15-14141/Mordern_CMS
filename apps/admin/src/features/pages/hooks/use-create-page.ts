'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { pagesApi } from '../services/pages.api';
import type { CreatePageInput } from '../types/page';
import { pagesKeys } from './query-keys';

/** `POST /pages` — `page.manage`-gated. No `status` field exists on the
 * DTO; the created page starts in the backend's own default status. */
export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePageInput) => pagesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagesKeys.lists() });
      toast.success('Page created.');
    },
  });
}
