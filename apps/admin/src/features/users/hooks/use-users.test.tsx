import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUsers } from './use-users';
import { usersApi } from '../services/users.api';

vi.mock('../services/users.api', () => ({
  usersApi: { list: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useUsers', () => {
  it('calls usersApi.list with the given filters', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const { result } = renderHook(() => useUsers({ page: 1, limit: 20 }), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('exposes the resolved { data, meta } shape', async () => {
    const payload = {
      data: [{ id: 'u1' }],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    };
    vi.mocked(usersApi.list).mockResolvedValue(payload as never);
    const { result } = renderHook(() => useUsers({}), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.data).toEqual(payload));
  });

  it('surfaces a rejected query as isError', async () => {
    vi.mocked(usersApi.list).mockRejectedValue(new Error('nope'));
    const { result } = renderHook(() => useUsers({}), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
