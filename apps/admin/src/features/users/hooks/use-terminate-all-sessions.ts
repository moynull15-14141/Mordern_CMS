'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { sessionsApi } from '../services/sessions.api';
import { usersKeys } from './query-keys';

/** `DELETE /users/:id/sessions` — terminates every session for the target
 * user (force logout). No "current session" concept exists to preserve —
 * this genuinely revokes all of them (docs/63_FRONTEND_USERS.md "Sessions"). */
export function useTerminateAllSessions(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sessionsApi.terminateAll(userId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.sessions(userId) });
      toast.success(response.message);
    },
  });
}
