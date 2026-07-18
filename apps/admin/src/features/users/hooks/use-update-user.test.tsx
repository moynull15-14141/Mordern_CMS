import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateUser } from './use-update-user';
import { usersApi } from '../services/users.api';
import { toast } from '@/lib/toast';

vi.mock('../services/users.api', () => ({ usersApi: { update: vi.fn() } }));
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

describe('useUpdateUser', () => {
  it('calls usersApi.update with the id and input (pessimistic — no optimistic cache write)', async () => {
    vi.mocked(usersApi.update).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useUpdateUser('u1'), { wrapper: Wrapper });

    result.current.mutate({ displayName: 'New Name' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.update).toHaveBeenCalledWith('u1', { displayName: 'New Name' });
  });

  it('invalidates the detail and list queries on success', async () => {
    vi.mocked(usersApi.update).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useUpdateUser('u1'), { wrapper: Wrapper });

    result.current.mutate({ displayName: 'New Name' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users', 'detail', 'u1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('User updated.');
  });
});
