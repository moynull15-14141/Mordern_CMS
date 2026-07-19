import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateLayout } from './use-update-layout';
import { layoutsApi } from '../services/layouts.api';
import { toast } from '@/lib/toast';

vi.mock('../services/layouts.api', () => ({ layoutsApi: { update: vi.fn() } }));
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

describe('useUpdateLayout', () => {
  it('calls layoutsApi.update with id and input, invalidates detail + list, and toasts success', async () => {
    vi.mocked(layoutsApi.update).mockResolvedValue({ id: 'l1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useUpdateLayout('l1'), { wrapper: Wrapper });

    const input = { name: 'New Name' };
    result.current.mutate(input as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(layoutsApi.update).toHaveBeenCalledWith('l1', input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['layouts', 'detail', 'l1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['layouts', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Layout updated.');
  });
});
