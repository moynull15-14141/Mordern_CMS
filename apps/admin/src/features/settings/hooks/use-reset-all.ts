'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { settingsApi } from '../services/settings.api';
import { settingsKeys } from './query-keys';

/** `POST /settings/reset` — resets the entire 34-entry catalog back to
 * defaults; the overview page's global "Reset all settings" action. */
export function useResetAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => settingsApi.resetAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('All settings reset to defaults.');
    },
  });
}
