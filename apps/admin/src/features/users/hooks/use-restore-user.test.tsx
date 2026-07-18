import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useRestoreUser } from './use-restore-user';
import { usersApi } from '../services/users.api';
import { toast } from '@/lib/toast';

vi.mock('../services/users.api', () => ({ usersApi: { restore: vi.fn() } }));
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

describe('useRestoreUser', () => {
  it('calls usersApi.restore with the id', async () => {
    vi.mocked(usersApi.restore).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useRestoreUser(), { wrapper: Wrapper });

    result.current.mutate('u1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.restore).toHaveBeenCalledWith('u1');
  });

  it('invalidates the detail and list queries and shows a success toast', async () => {
    vi.mocked(usersApi.restore).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useRestoreUser(), { wrapper: Wrapper });

    result.current.mutate('u1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users', 'detail', 'u1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('User restored.');
  });
});
