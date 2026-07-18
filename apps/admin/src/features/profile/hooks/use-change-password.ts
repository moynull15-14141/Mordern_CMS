'use client';

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/lib/toast';
import { profileApi } from '../services/profile.api';
import type { ChangePasswordInput } from '@/features/users';

/** `POST /users/:id/change-password` (self-service, `id` = caller's own
 * id). Revokes every one of the caller's OWN sessions server-side
 * (docs/42_USER_MANAGEMENT_ARCHITECTURE.md "Password Flow"), including the
 * one currently in use — so this hook logs the caller out immediately
 * after a successful change rather than leaving the UI in a session that's
 * about to fail its next silent refresh. */
export function useChangePassword() {
  const { user, logout } = useAuth();

  return useMutation({
    mutationFn: (input: ChangePasswordInput) => {
      if (!user) {
        throw new Error('No authenticated user.');
      }
      return profileApi.changePassword(user.id, input);
    },
    onSuccess: async (response) => {
      toast.success(response.message);
      await logout();
    },
  });
}
