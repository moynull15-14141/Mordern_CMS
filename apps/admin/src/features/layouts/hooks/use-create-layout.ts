'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { layoutsApi } from '../services/layouts.api';
import type { CreateLayoutInput } from '../types/layout';
import { layoutsKeys } from './query-keys';

/** `POST /layouts` — `layout.manage`-gated. No `status` field on the DTO;
 * the created layout starts DRAFT server-side. */
export function useCreateLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLayoutInput) => layoutsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layoutsKeys.lists() });
      toast.success('Layout created.');
    },
  });
}
