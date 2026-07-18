import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateSetting } from './use-update-setting';
import { settingsApi } from '../services/settings.api';
import { toast } from '@/lib/toast';

vi.mock('../services/settings.api', () => ({ settingsApi: { updateSetting: vi.fn() } }));
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

describe('useUpdateSetting', () => {
  it('calls settingsApi.updateSetting with the key and input (pessimistic — no optimistic cache write)', async () => {
    vi.mocked(settingsApi.updateSetting).mockResolvedValue({ key: 'general.siteName' } as never);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useUpdateSetting('general.siteName'), { wrapper: Wrapper });

    result.current.mutate({ value: 'New Name' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(settingsApi.updateSetting).toHaveBeenCalledWith('general.siteName', { value: 'New Name' });
  });

  it('invalidates the key, category, and list queries on success', async () => {
    vi.mocked(settingsApi.updateSetting).mockResolvedValue({ key: 'general.siteName' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useUpdateSetting('general.siteName'), { wrapper: Wrapper });

    result.current.mutate({ value: 'New Name' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings', 'key', 'general.siteName'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings', 'category'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Setting updated.');
  });
});
