import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateProfile } from './use-update-profile';
import { profileApi } from '../services/profile.api';
import { toast } from '@/lib/toast';

vi.mock('../services/profile.api', () => ({ profileApi: { updateProfile: vi.fn() } }));
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

describe('useUpdateProfile', () => {
  it('calls profileApi.updateProfile with the input', async () => {
    vi.mocked(profileApi.updateProfile).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper });

    result.current.mutate({ firstName: 'Jane' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(profileApi.updateProfile).toHaveBeenCalledWith({ firstName: 'Jane' });
  });

  it('invalidates the profile me query and shows a success toast', async () => {
    vi.mocked(profileApi.updateProfile).mockResolvedValue({ id: 'u1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper });

    result.current.mutate({ firstName: 'Jane' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['profile', 'me'] });
    expect(toast.success).toHaveBeenCalledWith('Profile updated.');
  });
});
