import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateReusableBlock } from './use-update-reusable-block';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import { toast } from '@/lib/toast';

vi.mock('../services/reusable-blocks.api', () => ({ reusableBlocksApi: { update: vi.fn() } }));
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

describe('useUpdateReusableBlock', () => {
  it('calls reusableBlocksApi.update, invalidates detail+list, and toasts success', async () => {
    vi.mocked(reusableBlocksApi.update).mockResolvedValue({ id: 'rb-1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useUpdateReusableBlock('rb-1'), { wrapper: Wrapper });

    const input = { name: 'New name' };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reusableBlocksApi.update).toHaveBeenCalledWith('rb-1', input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reusable-blocks', 'detail', 'rb-1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reusable-blocks', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Reusable block updated.');
  });
});
