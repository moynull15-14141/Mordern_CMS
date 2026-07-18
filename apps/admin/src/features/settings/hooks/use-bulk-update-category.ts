'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { settingsApi } from '../services/settings.api';
import type { BulkUpdateInput, SettingCategory } from '../types/settings';
import { settingsKeys } from './query-keys';

/** `PUT /settings/category/:category` — the Category Settings form's submit
 * action; backs bulk save of every field on one category page in a single
 * request. Not transactional on the backend (`bulkUpdateCategory()` loops
 * `updateSetting()` per entry, docs/64_FRONTEND_SETTINGS.md "Conflicts
 * Discovered") — a partial failure is still possible and is surfaced via
 * the mutation's normal error state. */
export function useBulkUpdateCategory(category: SettingCategory) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkUpdateInput) => settingsApi.bulkUpdateCategory(category, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.category(category) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      toast.success('Settings saved.');
    },
  });
}
