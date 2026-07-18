import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateUser } from './use-create-user';
import { usersApi } from '../services/users.api';
import { toast } from '@/lib/toast';

vi.mock('../services/users.api', () => ({ usersApi: { create: vi.fn() } }));
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

describe('useCreateUser', () => {
  it('calls usersApi.create with the input', async () => {
    vi.mocked(usersApi.create).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useCreateUser(), { wrapper: Wrapper });

    result.current.mutate({ email: 'a@b.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.create).toHaveBeenCalledWith({ email: 'a@b.com' });
  });

  it('invalidates the users list and shows a success toast', async () => {
    vi.mocked(usersApi.create).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useCreateUser(), { wrapper: Wrapper });

    result.current.mutate({ email: 'a@b.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('User created.');
  });

  it('surfaces a rejected mutation as isError', async () => {
    vi.mocked(usersApi.create).mockRejectedValue(new Error('conflict'));
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useCreateUser(), { wrapper: Wrapper });

    result.current.mutate({ email: 'a@b.com' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
