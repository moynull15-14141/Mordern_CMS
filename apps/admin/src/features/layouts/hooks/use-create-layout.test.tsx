import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateLayout } from './use-create-layout';
import { layoutsApi } from '../services/layouts.api';
import { toast } from '@/lib/toast';

vi.mock('../services/layouts.api', () => ({ layoutsApi: { create: vi.fn() } }));
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

describe('useCreateLayout', () => {
  it('calls layoutsApi.create with the input, invalidates the list, and toasts success', async () => {
    vi.mocked(layoutsApi.create).mockResolvedValue({ id: 'l1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useCreateLayout(), { wrapper: Wrapper });

    const input = { name: 'Default', layoutPreset: 'default' };
    result.current.mutate(input as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(layoutsApi.create).toHaveBeenCalledWith(input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['layouts', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Layout created.');
  });
});
