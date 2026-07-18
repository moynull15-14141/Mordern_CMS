import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useRestoreTheme } from './use-restore-theme';
import { themesApi } from '../services/themes.api';
import { toast } from '@/lib/toast';

vi.mock('../services/themes.api', () => ({ themesApi: { restore: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  return {
    Wrapper: function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
    invalidateSpy,
  };
}

describe('useRestoreTheme', () => {
  it('calls themesApi.restore with id, invalidates detail+list, and toasts success', async () => {
    vi.mocked(themesApi.restore).mockResolvedValue({ id: 't1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useRestoreTheme(), { wrapper: Wrapper });

    result.current.mutate('t1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(themesApi.restore).toHaveBeenCalledWith('t1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['themes', 'detail', 't1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['themes', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Theme restored.');
  });
});
