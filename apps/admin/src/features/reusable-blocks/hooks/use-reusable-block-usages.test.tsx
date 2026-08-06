import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useReusableBlockUsages } from './use-reusable-block-usages';
import { reusableBlocksApi } from '../services/reusable-blocks.api';

vi.mock('../services/reusable-blocks.api', () => ({ reusableBlocksApi: { getUsages: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useReusableBlockUsages', () => {
  it('calls reusableBlocksApi.getUsages with the given id when enabled', async () => {
    vi.mocked(reusableBlocksApi.getUsages).mockResolvedValue([]);
    const { result } = renderHook(() => useReusableBlockUsages('rb-1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reusableBlocksApi.getUsages).toHaveBeenCalledWith('rb-1');
  });

  it('does not fetch when enabled is false — the lazy-load contract for the Delete dialog', () => {
    const { result } = renderHook(() => useReusableBlockUsages('rb-1', { enabled: false }), {
      wrapper: wrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(reusableBlocksApi.getUsages).not.toHaveBeenCalled();
  });

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useReusableBlockUsages(''), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(reusableBlocksApi.getUsages).not.toHaveBeenCalled();
  });
});
