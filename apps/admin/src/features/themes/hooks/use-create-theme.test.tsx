import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateTheme } from './use-create-theme';
import { themesApi } from '../services/themes.api';
import { toast } from '@/lib/toast';

vi.mock('../services/themes.api', () => ({ themesApi: { create: vi.fn() } }));
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

describe('useCreateTheme', () => {
  it('calls themesApi.create with the input, invalidates the list, and toasts success', async () => {
    vi.mocked(themesApi.create).mockResolvedValue({ id: 't1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useCreateTheme(), { wrapper: Wrapper });

    const input = { name: 'Classic' };
    result.current.mutate(input as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(themesApi.create).toHaveBeenCalledWith(input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['themes', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Theme created.');
  });
});
