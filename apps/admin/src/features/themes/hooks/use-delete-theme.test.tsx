import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeleteTheme } from './use-delete-theme';
import { themesApi } from '../services/themes.api';
import { toast } from '@/lib/toast';

vi.mock('../services/themes.api', () => ({ themesApi: { remove: vi.fn() } }));
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

describe('useDeleteTheme', () => {
  it('calls themesApi.remove with id, invalidates detail+list+active, and toasts success', async () => {
    vi.mocked(themesApi.remove).mockResolvedValue({ id: 't1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useDeleteTheme(), { wrapper: Wrapper });

    result.current.mutate('t1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(themesApi.remove).toHaveBeenCalledWith('t1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['themes', 'detail', 't1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['themes', 'list'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['themes', 'active'] });
    expect(toast.success).toHaveBeenCalledWith('Theme deleted.');
  });
});
