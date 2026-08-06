import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeleteReusableBlock } from './use-delete-reusable-block';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import { toast } from '@/lib/toast';
import { ApiError } from '@/lib/api-error';

vi.mock('../services/reusable-blocks.api', () => ({ reusableBlocksApi: { remove: vi.fn() } }));
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

describe('useDeleteReusableBlock', () => {
  it('calls reusableBlocksApi.remove, invalidates detail+list, and toasts success', async () => {
    vi.mocked(reusableBlocksApi.remove).mockResolvedValue({ id: 'rb-1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useDeleteReusableBlock(), { wrapper: Wrapper });

    result.current.mutate('rb-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reusableBlocksApi.remove).toHaveBeenCalledWith('rb-1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reusable-blocks', 'detail', 'rb-1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reusable-blocks', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Reusable block deleted.');
  });

  it('toasts the API error message when deletion is blocked (still referenced)', async () => {
    const apiError = new ApiError({
      message: 'This reusable block cannot be deleted — it is still used in 1 place.',
      code: 'BUSINESS_CONFLICT',
      status: 409,
    });
    vi.mocked(reusableBlocksApi.remove).mockRejectedValue(apiError);
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useDeleteReusableBlock(), { wrapper: Wrapper });

    result.current.mutate('rb-1');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith(
      'This reusable block cannot be deleted — it is still used in 1 place.'
    );
  });
});
