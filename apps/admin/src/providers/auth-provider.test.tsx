import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { useAuth } from '@/hooks/use-auth';
import { tokenStore } from '@/lib/token-store';
import { mockAuthTokens, mockCurrentUser } from '@/test/fixtures/auth';
import { toast as sonnerToast } from 'sonner';

const { getMock, postMock, onSessionExpiredMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  onSessionExpiredMock: vi.fn((_listener: () => void) => () => {}),
}));

vi.mock('@/lib/api-client', () => ({
  api: { get: getMock, post: postMock },
  onSessionExpired: onSessionExpiredMock,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  getMock.mockReset();
  postMock.mockReset();
  vi.mocked(sonnerToast.info).mockClear();
});

afterEach(() => {
  tokenStore.clearTokens();
});

describe('AuthProvider', () => {
  it('does not query /auth/me when no tokens are stored, and reports unauthenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(getMock).not.toHaveBeenCalled();
  });

  it('queries /auth/me and /authorization/me once a token is present, and exposes the resolved user', async () => {
    tokenStore.setTokens(mockAuthTokens({ accessToken: 'a', refreshToken: 'r' }));
    getMock.mockImplementation((url: string) => {
      if (url === '/auth/me') return Promise.resolve({ id: '1', email: 'a@b.com' });
      if (url === '/authorization/me')
        return Promise.resolve({ roles: ['Editor'], permissions: ['article.create'] });
      return Promise.reject(new Error(`unexpected url ${url}`));
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user).toEqual({ id: '1', email: 'a@b.com' });
    expect(result.current.roles).toEqual(['Editor']);
    expect(result.current.permissions).toEqual(['article.create']);
  });

  it('login() stores tokens, seeds the user from the response (no redundant GET /auth/me), and enables authorization/me', async () => {
    getMock.mockImplementation((url: string) => {
      if (url === '/authorization/me') return Promise.resolve({ roles: [], permissions: [] });
      return Promise.reject(new Error(`unexpected url ${url}`));
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);

    const tokens = mockAuthTokens({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      user: mockCurrentUser({ id: '1', email: 'a@b.com' }),
    });

    await act(async () => {
      await result.current.login(tokens);
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user).toEqual(tokens.user);
    expect(tokenStore.getAccessToken()).toBe('new-access');
    expect(getMock).not.toHaveBeenCalledWith('/auth/me');
  });

  it('logout() sends the stored refreshToken in the request body and clears the session even if the call fails', async () => {
    tokenStore.setTokens(mockAuthTokens({ accessToken: 'a', refreshToken: 'r' }));
    getMock.mockResolvedValue({ id: '1' });
    postMock.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(postMock).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'r' });
    expect(tokenStore.hasTokens()).toBe(false);
    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
  });

  it('logout() does not call the endpoint when no refresh token is stored', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.logout();
    });

    expect(postMock).not.toHaveBeenCalled();
  });

  it('registers a session-expired listener on mount', () => {
    renderHook(() => useAuth(), { wrapper });
    expect(onSessionExpiredMock).toHaveBeenCalled();
  });

  it('shows a "session expired" toast when the registered listener fires (a genuine expiry, per docs/56)', () => {
    renderHook(() => useAuth(), { wrapper });
    const listener = onSessionExpiredMock.mock.calls[0][0] as () => void;

    listener();

    expect(sonnerToast.info).toHaveBeenCalledWith(
      'Your session expired',
      expect.objectContaining({ description: 'Please log in again to continue.' })
    );
  });

  it('does not show a session-expired toast merely from a first-time unauthenticated visit', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(sonnerToast.info).not.toHaveBeenCalled();
  });
});
