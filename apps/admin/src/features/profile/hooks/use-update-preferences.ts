'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { profileApi } from '../services/profile.api';
import type { UpdatePreferencesInput } from '@/features/users';
import { profileKeys } from './query-keys';

/** `PATCH /users/me/preferences` — PATCH semantics, merges into
 * `metadata.preferences`. */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePreferencesInput) => profileApi.updatePreferences(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast.success('Preferences updated.');
    },
  });
}
