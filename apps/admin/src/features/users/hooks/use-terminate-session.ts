'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { sessionsApi } from '../services/sessions.api';
import { usersKeys } from './query-keys';

/** `DELETE /users/:id/sessions/:sessionId` — terminates one session. */
export function useTerminateSession(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => sessionsApi.terminate(userId, sessionId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.sessions(userId) });
      toast.success(response.message);
    },
  });
}
