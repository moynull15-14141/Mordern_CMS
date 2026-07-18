import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTerminateSession } from './use-terminate-session';
import { sessionsApi } from '../services/sessions.api';
import { toast } from '@/lib/toast';

vi.mock('../services/sessions.api', () => ({ sessionsApi: { terminate: vi.fn() } }));
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

describe('useTerminateSession', () => {
  it('calls sessionsApi.terminate with the user id and session id', async () => {
    vi.mocked(sessionsApi.terminate).mockResolvedValue({ message: 'Session terminated.' });
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useTerminateSession('u1'), { wrapper: Wrapper });

    result.current.mutate('s1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(sessionsApi.terminate).toHaveBeenCalledWith('u1', 's1');
  });

  it('invalidates the sessions query and shows the backend message', async () => {
    vi.mocked(sessionsApi.terminate).mockResolvedValue({ message: 'Session terminated.' });
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useTerminateSession('u1'), { wrapper: Wrapper });

    result.current.mutate('s1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['users', 'u1', 'sessions'] });
    expect(toast.success).toHaveBeenCalledWith('Session terminated.');
  });
});
