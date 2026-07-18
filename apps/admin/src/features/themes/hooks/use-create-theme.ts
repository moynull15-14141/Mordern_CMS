'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { themesApi } from '../services/themes.api';
import type { CreateThemeInput } from '../types/theme';
import { themesKeys } from './query-keys';

/** `POST /themes` — `theme.manage`-gated. No `status`/`isActive` field on
 * the DTO; the created theme starts DRAFT and inactive server-side. */
export function useCreateTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateThemeInput) => themesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: themesKeys.lists() });
      toast.success('Theme created.');
    },
  });
}
