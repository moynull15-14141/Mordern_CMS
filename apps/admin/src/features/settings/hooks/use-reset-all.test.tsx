import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useResetAll } from './use-reset-all';
import { settingsApi } from '../services/settings.api';
import { toast } from '@/lib/toast';

vi.mock('../services/settings.api', () => ({ settingsApi: { resetAll: vi.fn() } }));
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

describe('useResetAll', () => {
  it('calls settingsApi.resetAll with no arguments', async () => {
    vi.mocked(settingsApi.resetAll).mockResolvedValue({ resetCount: 34 });
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useResetAll(), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(settingsApi.resetAll).toHaveBeenCalledWith();
  });

  it('invalidates every settings query and shows a success toast', async () => {
    vi.mocked(settingsApi.resetAll).mockResolvedValue({ resetCount: 34 });
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useResetAll(), { wrapper: Wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings'] });
    expect(toast.success).toHaveBeenCalledWith('All settings reset to defaults.');
  });
});
