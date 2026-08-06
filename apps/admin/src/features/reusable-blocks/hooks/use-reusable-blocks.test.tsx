import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useReusableBlocks } from './use-reusable-blocks';
import { reusableBlocksApi } from '../services/reusable-blocks.api';

vi.mock('../services/reusable-blocks.api', () => ({ reusableBlocksApi: { list: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useReusableBlocks', () => {
  it('calls reusableBlocksApi.list with the given filters', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({ data: [], meta: {} } as never);
    const filters = { page: 1, limit: 20, search: 'cta' };
    const { result } = renderHook(() => useReusableBlocks(filters), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reusableBlocksApi.list).toHaveBeenCalledWith(filters);
  });
});
