import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useArticle } from './use-article';
import { articlesApi } from '../services/articles.api';

vi.mock('../services/articles.api', () => ({ articlesApi: { get: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useArticle', () => {
  it('calls articlesApi.get with the given id', async () => {
    vi.mocked(articlesApi.get).mockResolvedValue({ id: 'a1' } as never);
    const { result } = renderHook(() => useArticle('a1'), { wrapper: wrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(articlesApi.get).toHaveBeenCalledWith('a1');
  });

  it('does not query when id is empty', () => {
    const { result } = renderHook(() => useArticle(''), { wrapper: wrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(articlesApi.get).not.toHaveBeenCalled();
  });
});
