import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useChangePassword } from './use-change-password';
import { profileApi } from '../services/profile.api';
import { toast } from '@/lib/toast';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';

vi.mock('../services/profile.api', () => ({ profileApi: { changePassword: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(user: AuthContextValue['user'], logoutMock = vi.fn().mockResolvedValue(undefined)) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const authValue: AuthContextValue = {
    user,
    roles: [],
    permissions: [],
    isAuthenticated: Boolean(user),
    isLoading: false,
    login: async () => {},
    logout: logoutMock,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

const currentUser = { id: 'u1', email: 'a@b.com', username: null, displayName: null, status: 'ACTIVE' };

describe('useChangePassword', () => {
  it('calls profileApi.changePassword with the caller own id and input', async () => {
    vi.mocked(profileApi.changePassword).mockResolvedValue({ message: 'Password changed. All sessions have been logged out.' });
    const { result } = renderHook(() => useChangePassword(), { wrapper: wrapper(currentUser) });

    result.current.mutate({ currentPassword: 'old', newPassword: 'New1!aaaa' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profileApi.changePassword).toHaveBeenCalledWith('u1', {
      currentPassword: 'old',
      newPassword: 'New1!aaaa',
    });
  });

  it('shows the backend message and logs the caller out on success', async () => {
    vi.mocked(profileApi.changePassword).mockResolvedValue({ message: 'Password changed. All sessions have been logged out.' });
    const logoutMock = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useChangePassword(), { wrapper: wrapper(currentUser, logoutMock) });

    result.current.mutate({ currentPassword: 'old', newPassword: 'New1!aaaa' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Password changed. All sessions have been logged out.');
    expect(logoutMock).toHaveBeenCalled();
  });

  it('rejects without calling the API when there is no authenticated user', async () => {
    const { result } = renderHook(() => useChangePassword(), { wrapper: wrapper(null) });

    result.current.mutate({ currentPassword: 'old', newPassword: 'New1!aaaa' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(profileApi.changePassword).not.toHaveBeenCalled();
  });
});
