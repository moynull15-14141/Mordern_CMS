import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateReusableBlock } from './use-create-reusable-block';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import { toast } from '@/lib/toast';

vi.mock('../services/reusable-blocks.api', () => ({ reusableBlocksApi: { create: vi.fn() } }));
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

describe('useCreateReusableBlock', () => {
  it('calls reusableBlocksApi.create, invalidates the list, and toasts success', async () => {
    vi.mocked(reusableBlocksApi.create).mockResolvedValue({ id: 'rb-1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useCreateReusableBlock(), { wrapper: Wrapper });

    const input = { name: 'CTA', blockType: 'callout', data: {} };
    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reusableBlocksApi.create).toHaveBeenCalledWith(input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reusable-blocks', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Reusable block created.');
  });
});
