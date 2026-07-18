import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUserSessions } from './use-user-sessions';
import { sessionsApi } from '../services/sessions.api';

vi.mock('../services/sessions.api', () => ({ sessionsApi: { list: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useUserSessions', () => {
  it('calls sessionsApi.list with the given user id', async () => {
    vi.mocked(sessionsApi.list).mockResolvedValue([]);
    const { result } = renderHook(() => useUserSessions('u1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(sessionsApi.list).toHaveBeenCalledWith('u1');
  });

  it('does not fetch when userId is undefined', () => {
    const { result } = renderHook(() => useUserSessions(undefined), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(sessionsApi.list).not.toHaveBeenCalled();
  });
});
