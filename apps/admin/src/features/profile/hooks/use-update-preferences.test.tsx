import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdatePreferences } from './use-update-preferences';
import { profileApi } from '../services/profile.api';
import { toast } from '@/lib/toast';

vi.mock('../services/profile.api', () => ({ profileApi: { updatePreferences: vi.fn() } }));
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

describe('useUpdatePreferences', () => {
  it('calls profileApi.updatePreferences with the input', async () => {
    vi.mocked(profileApi.updatePreferences).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useUpdatePreferences(), { wrapper: Wrapper });

    result.current.mutate({ theme: 'DARK' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profileApi.updatePreferences).toHaveBeenCalledWith({ theme: 'DARK' });
  });

  it('invalidates the profile me query and shows a success toast', async () => {
    vi.mocked(profileApi.updatePreferences).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useUpdatePreferences(), { wrapper: Wrapper });

    result.current.mutate({ theme: 'DARK' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile', 'me'] });
    expect(toast.success).toHaveBeenCalledWith('Preferences updated.');
  });
});
