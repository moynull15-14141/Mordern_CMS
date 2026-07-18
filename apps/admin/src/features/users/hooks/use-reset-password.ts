'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { usersApi } from '../services/users.api';
import type { AdminResetPasswordInput } from '../types/user';
import { usersKeys } from './query-keys';

/** `POST /users/:id/reset-password` — admin action, `users.manage`-gated,
 * no current-password check. Revokes every session the target user holds
 * server-side, so their session list is stale afterward. */
export function useResetPassword(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminResetPasswordInput) => usersApi.resetPassword(userId, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.sessions(userId) });
      toast.success(response.message);
    },
  });
}
