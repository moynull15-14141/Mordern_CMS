'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { profileApi } from '../services/profile.api';
import { profileKeys } from './query-keys';

/** `DELETE /users/me/avatar` — clears `profileImageId`. No "set avatar"
 * counterpart is wired to any UI this milestone (no MediaAsset picker
 * exists — Media is out of scope; see docs/63_FRONTEND_USERS.md). */
export function useRemoveAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileApi.removeAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
      toast.success('Avatar removed.');
    },
  });
}
