import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { usePublishArticle } from './use-publish-article';
import { articlesApi } from '../services/articles.api';
import { toast } from '@/lib/toast';

vi.mock('../services/articles.api', () => ({ articlesApi: { publish: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePublishArticle', () => {
  it('calls articlesApi.publish with the id and toasts success', async () => {
    vi.mocked(articlesApi.publish).mockResolvedValue({ id: 'a1' } as never);
    const { result } = renderHook(() => usePublishArticle(), { wrapper: wrapper() });

    result.current.mutate('a1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(articlesApi.publish).toHaveBeenCalledWith('a1');
    expect(toast.success).toHaveBeenCalledWith('Article published.');
  });
});
