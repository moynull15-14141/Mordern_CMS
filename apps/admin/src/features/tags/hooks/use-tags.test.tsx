import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useTags } from './use-tags';
import { useTag } from './use-tag';
import { tagsApi } from '../services/tags.api';

vi.mock('../services/tags.api', () => ({ tagsApi: { list: vi.fn(), get: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useTags', () => {
  it('calls tagsApi.list with the given filters', async () => {
    vi.mocked(tagsApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const { result } = renderHook(() => useTags({ page: 1, limit: 20 }), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(tagsApi.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });
});

describe('useTag', () => {
  it('calls tagsApi.get with the given id', async () => {
    vi.mocked(tagsApi.get).mockResolvedValue({ id: 't1' } as never);
    const { result } = renderHook(() => useTag('t1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(tagsApi.get).toHaveBeenCalledWith('t1');
  });

  it('does not query when id is empty', () => {
    const { result } = renderHook(() => useTag(''), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(tagsApi.get).not.toHaveBeenCalled();
  });
});
