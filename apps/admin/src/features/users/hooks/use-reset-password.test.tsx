import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useResetPassword } from './use-reset-password';
import { usersApi } from '../services/users.api';
import { toast } from '@/lib/toast';

vi.mock('../services/users.api', () => ({ usersApi: { resetPassword: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  return {
    Wrapper: function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
    invalidateSpy,
  };
}

describe('useResetPassword', () => {
  it('calls usersApi.resetPassword with the target user id and input', async () => {
    vi.mocked(usersApi.resetPassword).mockResolvedValue({ message: 'Password reset. All sessions have been logged out.' });
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useResetPassword('u1'), { wrapper: Wrapper });

    result.current.mutate({ newPassword: 'New1!aaaa' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.resetPassword).toHaveBeenCalledWith('u1', { newPassword: 'New1!aaaa' });
  });

  it('invalidates the target user sessions query and shows the backend message as a toast', async () => {
    vi.mocked(usersApi.resetPassword).mockResolvedValue({ message: 'Password reset. All sessions have been logged out.' });
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useResetPassword('u1'), { wrapper: Wrapper });

    result.current.mutate({ newPassword: 'New1!aaaa' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users', 'u1', 'sessions'] });
    expect(toast.success).toHaveBeenCalledWith('Password reset. All sessions have been logged out.');
  });
});
