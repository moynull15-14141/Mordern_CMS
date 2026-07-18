'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { profileApi } from '../services/profile.api';
import type { UpdateProfileInput } from '@/features/users';
import { profileKeys } from './query-keys';

/** `PATCH /users/me/profile` — PATCH semantics, merges into
 * `metadata.profile`. Does not touch `email`/`username`/`displayName` (no
 * self-service endpoint exists for those — docs/63_FRONTEND_USERS.md). */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast.success('Profile updated.');
    },
  });
}
