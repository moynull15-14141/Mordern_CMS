'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { useAuth } from '@/hooks/use-auth';
import type { AuthTokens } from '@/types/auth';
import type { LoginFormValues } from '@/features/auth/schemas/login.schema';

/**
 * POST /auth/login (`@Public()` — docs/53_API_FREEZE.md "Authentication")
 * followed by AuthProvider.login(), which persists the returned tokens and
 * seeds the session query cache. GuestRoute (app/(auth)/layout.tsx)
 * observes the resulting `isAuthenticated` flip and performs the actual
 * post-login redirect — this hook does not navigate itself.
 */
export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (values: LoginFormValues) =>
      api.post<AuthTokens>(API_ENDPOINTS.AUTH.LOGIN, values, { public: true }),
    onSuccess: (tokens) => login(tokens),
  });
}
