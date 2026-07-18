'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { settingsApi } from '../services/settings.api';
import type { UpdateSettingInput } from '../types/settings';
import { settingsKeys } from './query-keys';

/** `PUT /settings/:key` — deliberately PUT, not PATCH (confirmed intentional,
 * docs/39_SETTINGS_ARCHITECTURE.md "PUT vs PATCH"; a Setting's only mutable
 * field is `value`, so PUT fully replaces that one field). Pessimistic,
 * mirroring `useUpdateUser` — no optimistic cache write. */
export function useUpdateSetting(key: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSettingInput) => settingsApi.updateSetting(key, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.key(key) });
      queryClient.invalidateQueries({ queryKey: settingsKeys.categories() });
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
      toast.success('Setting updated.');
    },
  });
}
