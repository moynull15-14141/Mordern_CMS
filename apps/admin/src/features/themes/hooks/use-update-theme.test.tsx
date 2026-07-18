import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateTheme } from './use-update-theme';
import { themesApi } from '../services/themes.api';
import { toast } from '@/lib/toast';

vi.mock('../services/themes.api', () => ({ themesApi: { update: vi.fn() } }));
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

describe('useUpdateTheme', () => {
  it('calls themesApi.update with id and input, invalidates detail+list+active, and toasts success', async () => {
    vi.mocked(themesApi.update).mockResolvedValue({ id: 't1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useUpdateTheme('t1'), { wrapper: Wrapper });

    const input = { name: 'New Name' };
    result.current.mutate(input as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(themesApi.update).toHaveBeenCalledWith('t1', input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['themes', 'detail', 't1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['themes', 'list'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['themes', 'active'] });
    expect(toast.success).toHaveBeenCalledWith('Theme updated.');
  });
});
