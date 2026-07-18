import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useRemoveAvatar } from './use-remove-avatar';
import { profileApi } from '../services/profile.api';
import { toast } from '@/lib/toast';

vi.mock('../services/profile.api', () => ({ profileApi: { removeAvatar: vi.fn() } }));
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

describe('useRemoveAvatar', () => {
  it('calls profileApi.removeAvatar', async () => {
    vi.mocked(profileApi.removeAvatar).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useRemoveAvatar(), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profileApi.removeAvatar).toHaveBeenCalled();
  });

  it('invalidates the profile me query and shows a success toast', async () => {
    vi.mocked(profileApi.removeAvatar).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useRemoveAvatar(), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile', 'me'] });
    expect(toast.success).toHaveBeenCalledWith('Avatar removed.');
  });
});
