'use client';

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, onSessionExpired } from '@/lib/api-client';
import { tokenStore } from '@/lib/token-store';
import { toast } from '@/lib/toast';
import { queryKeys } from '@/constants/query-keys';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { AuthTokens, CurrentUser, MyAuthorization } from '@/types/auth';

/**
 * Auth Context — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Authentication" /
 * "Permission Flow". Session bootstrap only (GET /auth/me + GET
 * /authorization/me, both real, frozen, read-only endpoints) — NO login
 * page/credentials-submission flow is implemented here, per Frontend
 * Milestone 1's explicit scope. `login()` completes the client-side
 * session after a future login page has already obtained tokens from
 * POST /auth/login itself.
 */
export interface AuthContextValue {
  user: CurrentUser | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // useSyncExternalStore (not useState+useEffect) — the SSR snapshot must be
  // `false` (no localStorage on the server) while the client's real value
  // takes over on hydration without a synchronous setState-in-effect.
  const hasTokens = useSyncExternalStore(tokenStore.subscribe, tokenStore.hasTokens, () => false);

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => api.get<CurrentUser>(API_ENDPOINTS.AUTH.ME),
    enabled: hasTokens,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const authorizationQuery = useQuery({
    queryKey: queryKeys.authorization.me(),
    queryFn: () => api.get<MyAuthorization>(API_ENDPOINTS.AUTHORIZATION.ME),
    enabled: hasTokens,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    // tokenStore.clearTokens() (called by the interceptor's refresh-failure
    // path) already flips `hasTokens` via the store subscription above —
    // this listener only needs to drop the now-stale query data. It only
    // ever fires after a request that HAD a token failed to refresh, never
    // for a visitor who was never authenticated (those requests are never
    // sent — see the `enabled: hasTokens` queries above), so a toast here
    // correctly implements docs/56_ADMIN_FRONTEND_ARCHITECTURE.md
    // "Authentication"'s local-state distinction: "never logged in" (silent
    // redirect, no toast) vs. "was logged in, now expired" (toast).
    return onSessionExpired(() => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
      queryClient.removeQueries({ queryKey: queryKeys.authorization.me() });
      toast.info('Your session expired', 'Please log in again to continue.');
    });
  }, [queryClient]);

  const login = useCallback(
    async (tokens: AuthTokens) => {
      tokenStore.setTokens(tokens);
      // The login response already carries the current user (AuthTokensDto.user)
      // — seed the auth.me cache directly instead of firing a redundant
      // GET /auth/me. authorization/me has no login-response equivalent, so
      // that one still needs an actual (re)fetch.
      queryClient.setQueryData(queryKeys.auth.me(), tokens.user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.authorization.me() });
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = tokenStore.getRefreshToken();
      if (refreshToken) {
        // /auth/logout requires { refreshToken } in the body to know which
        // session to revoke (it is not @Public(), so the still-attached
        // access token also satisfies its own JwtAuthGuard requirement).
        await api.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch {
      // Best-effort — the session is cleared client-side regardless of
      // whether the backend call succeeds (e.g. the token may already be
      // expired, which is exactly the case logout needs to still work for).
    } finally {
      tokenStore.clearTokens();
      queryClient.removeQueries({ queryKey: queryKeys.auth.me() });
      queryClient.removeQueries({ queryKey: queryKeys.authorization.me() });
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      roles: authorizationQuery.data?.roles ?? [],
      permissions: authorizationQuery.data?.permissions ?? [],
      isAuthenticated: hasTokens && Boolean(meQuery.data),
      isLoading: hasTokens && (meQuery.isPending || authorizationQuery.isPending),
      login,
      logout,
    }),
    [
      hasTokens,
      meQuery.data,
      meQuery.isPending,
      authorizationQuery.data,
      authorizationQuery.isPending,
      login,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
