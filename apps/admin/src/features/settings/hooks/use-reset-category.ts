'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { settingsApi } from '../services/settings.api';
import type { SettingCategory } from '../types/settings';
import { settingsKeys } from './query-keys';

/** `POST /settings/reset/category` — the real analog to "restore" for a
 * fixed catalog with no per-row delete (docs/64_FRONTEND_SETTINGS.md
 * "Conflicts Discovered"): resets every setting in one category back to its
 * default value. */
export function useResetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: SettingCategory) => settingsApi.resetCategory(category),
    onSuccess: (_data, category) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.category(category) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      toast.success('Category reset to defaults.');
    },
  });
}
