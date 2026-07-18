import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUser } from './use-user';
import { usersApi } from '../services/users.api';

vi.mock('../services/users.api', () => ({
  usersApi: { get: vi.fn() },
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

describe('useUser', () => {
  it('calls usersApi.get with the given id when defined', async () => {
    vi.mocked(usersApi.get).mockResolvedValue({ id: 'u1' } as never);
    const { result } = renderHook(() => useUser('u1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(usersApi.get).toHaveBeenCalledWith('u1');
  });

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useUser(undefined), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(usersApi.get).not.toHaveBeenCalled();
  });
});
