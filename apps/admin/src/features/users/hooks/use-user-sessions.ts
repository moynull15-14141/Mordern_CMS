'use client';

import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '../services/sessions.api';
import { usersKeys } from './query-keys';

/** `GET /users/:id/sessions` — admin-only, `users.manage`-gated. No
 * self-service `/users/me/sessions` exists (docs/63_FRONTEND_USERS.md). */
export function useUserSessions(userId: string | undefined) {
  return useQuery({
    queryKey: usersKeys.sessions(userId ?? ''),
    queryFn: () => sessionsApi.list(userId as string),
    enabled: Boolean(userId),
  });
}
