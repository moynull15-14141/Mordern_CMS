import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useArticles } from './use-articles';
import { articlesApi } from '../services/articles.api';

vi.mock('../services/articles.api', () => ({ articlesApi: { list: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useArticles', () => {
  it('calls articlesApi.list with the given filters', async () => {
    vi.mocked(articlesApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const { result } = renderHook(() => useArticles({ page: 1, limit: 20, status: 'DRAFT' }), {
      wrapper: wrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(articlesApi.list).toHaveBeenCalledWith({ page: 1, limit: 20, status: 'DRAFT' });
  });

  it('surfaces a rejected query as isError', async () => {
    vi.mocked(articlesApi.list).mockRejectedValue(new Error('nope'));
    const { result } = renderHook(() => useArticles({}), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
