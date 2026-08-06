import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDuplicateReusableBlock } from './use-duplicate-reusable-block';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import type { ReusableBlock } from '../types/reusable-block';
import { toast } from '@/lib/toast';

vi.mock('../services/reusable-blocks.api', () => ({ reusableBlocksApi: { duplicate: vi.fn() } }));
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

const source: ReusableBlock = {
  id: 'rb-1',
  name: 'Newsletter callout',
  description: null,
  category: null,
  blockType: 'callout',
  data: { text: 'Subscribe!' },
  children: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('useDuplicateReusableBlock', () => {
  it('calls reusableBlocksApi.duplicate, invalidates the list, and toasts success', async () => {
    vi.mocked(reusableBlocksApi.duplicate).mockResolvedValue({ id: 'rb-2' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useDuplicateReusableBlock(), { wrapper: Wrapper });

    result.current.mutate({ source, name: 'Newsletter callout (copy)' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reusableBlocksApi.duplicate).toHaveBeenCalledWith(source, 'Newsletter callout (copy)');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['reusable-blocks', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Reusable block duplicated.');
  });
});
