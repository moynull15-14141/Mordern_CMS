import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useReusableBlock } from './use-reusable-block';
import { reusableBlocksApi } from '../services/reusable-blocks.api';

vi.mock('../services/reusable-blocks.api', () => ({ reusableBlocksApi: { get: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useReusableBlock', () => {
  it('calls reusableBlocksApi.get with the given id', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue({ id: 'rb-1' } as never);
    const { result } = renderHook(() => useReusableBlock('rb-1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reusableBlocksApi.get).toHaveBeenCalledWith('rb-1');
  });

  it('does not query when id is empty', () => {
    const { result } = renderHook(() => useReusableBlock(''), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(reusableBlocksApi.get).not.toHaveBeenCalled();
  });
});
