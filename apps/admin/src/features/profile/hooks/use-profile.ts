'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { profileApi } from '../services/profile.api';
import { profileKeys } from './query-keys';

/** `GET /users/me` — the full `User` shape (profile/preferences included),
 * distinct from `useAuth().user` (Identity's thinner `CurrentUser`, `GET
 * /auth/me`). Gated on `isAuthenticated`, same precedent as
 * `AuthProvider`'s own bootstrap queries. */
export function useProfile() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => profileApi.getMe(),
    enabled: isAuthenticated,
  });
}
