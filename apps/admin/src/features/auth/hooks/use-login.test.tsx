import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLogin } from './use-login';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { mockAuthTokens } from '@/test/fixtures/auth';

const postMock = vi.fn();
vi.mock('@/lib/api-client', () => ({
  api: { post: (...args: unknown[]) => postMock(...args) },
}));

function wrapper(loginMock: (tokens: unknown) => Promise<void>) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: null,
    roles: [],
    permissions: [],
    isAuthenticated: false,
    isLoading: false,
    login: loginMock,
    logout: async () => {},
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

describe('useLogin', () => {
  it('POSTs to /auth/login as a public request', async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);
    postMock.mockResolvedValue(mockAuthTokens());
    const { result } = renderHook(() => useLogin(), { wrapper: wrapper(loginMock) });

    result.current.mutate({ email: 'a@b.com', password: 'x' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(postMock).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'a@b.com', password: 'x' },
      { public: true }
    );
  });

  it('calls AuthContext.login() with the returned tokens on success', async () => {
    const loginMock = vi.fn().mockResolvedValue(undefined);
    const tokens = mockAuthTokens({ accessToken: 'a1' });
    postMock.mockResolvedValue(tokens);
    const { result } = renderHook(() => useLogin(), { wrapper: wrapper(loginMock) });

    result.current.mutate({ email: 'a@b.com', password: 'x' });

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith(tokens));
  });

  it('surfaces a rejected mutation as isError', async () => {
    const loginMock = vi.fn();
    postMock.mockRejectedValue(new Error('Invalid email or password'));
    const { result } = renderHook(() => useLogin(), { wrapper: wrapper(loginMock) });

    result.current.mutate({ email: 'a@b.com', password: 'wrong' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(loginMock).not.toHaveBeenCalled();
  });
});
