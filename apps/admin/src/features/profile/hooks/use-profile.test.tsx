import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useProfile } from './use-profile';
import { profileApi } from '../services/profile.api';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';

vi.mock('../services/profile.api', () => ({
  profileApi: { getMe: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(isAuthenticated: boolean) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: isAuthenticated ? { id: 'u1', email: 'a@b.com', username: null, displayName: null, status: 'ACTIVE' } : null,
    roles: [],
    permissions: [],
    isAuthenticated,
    isLoading: false,
    login: async () => {},
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

describe('useProfile', () => {
  it('calls profileApi.getMe when authenticated', async () => {
    vi.mocked(profileApi.getMe).mockResolvedValue({ id: 'u1' } as never);
    const { result } = renderHook(() => useProfile(), { wrapper: wrapper(true) });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profileApi.getMe).toHaveBeenCalled();
  });

  it('does not fetch when not authenticated', () => {
    const { result } = renderHook(() => useProfile(), { wrapper: wrapper(false) });
    expect(result.current.fetchStatus).toBe('idle');
    expect(profileApi.getMe).not.toHaveBeenCalled();
  });
});
