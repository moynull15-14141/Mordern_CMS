import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUpdateArticle } from './use-update-article';
import { articlesApi } from '../services/articles.api';
import { toast } from '@/lib/toast';

vi.mock('../services/articles.api', () => ({ articlesApi: { update: vi.fn() } }));
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

describe('useUpdateArticle', () => {
  it('calls articlesApi.update, invalidates detail+list, and toasts success', async () => {
    vi.mocked(articlesApi.update).mockResolvedValue({ id: 'a1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useUpdateArticle('a1'), { wrapper: Wrapper });

    result.current.mutate({ title: 'New title' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(articlesApi.update).toHaveBeenCalledWith('a1', { title: 'New title' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['articles', 'detail', 'a1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['articles', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Article updated.');
  });
});
