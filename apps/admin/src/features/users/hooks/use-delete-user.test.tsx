import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeleteUser } from './use-delete-user';
import { usersApi } from '../services/users.api';
import { toast } from '@/lib/toast';

vi.mock('../services/users.api', () => ({ usersApi: { remove: vi.fn() } }));
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

describe('useDeleteUser', () => {
  it('calls usersApi.remove with the id (soft delete)', async () => {
    vi.mocked(usersApi.remove).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDeleteUser(), { wrapper: Wrapper });

    result.current.mutate('u1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.remove).toHaveBeenCalledWith('u1');
  });

  it('invalidates the detail and list queries and shows a success toast', async () => {
    vi.mocked(usersApi.remove).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useDeleteUser(), { wrapper: Wrapper });

    result.current.mutate('u1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users', 'detail', 'u1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('User deleted.');
  });
});
