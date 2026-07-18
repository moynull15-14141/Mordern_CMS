import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDeleteArticle } from './use-delete-article';
import { articlesApi } from '../services/articles.api';
import { toast } from '@/lib/toast';

vi.mock('../services/articles.api', () => ({ articlesApi: { remove: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  return {
    Wrapper: function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
    invalidateSpy,
  };
}

describe('useDeleteArticle', () => {
  it('calls articlesApi.remove, invalidates detail+list, and toasts success', async () => {
    vi.mocked(articlesApi.remove).mockResolvedValue({ id: 'a1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useDeleteArticle(), { wrapper: Wrapper });

    result.current.mutate('a1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(articlesApi.remove).toHaveBeenCalledWith('a1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['articles', 'detail', 'a1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['articles', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Article deleted.');
  });
});
