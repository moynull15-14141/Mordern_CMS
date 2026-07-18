import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCreateArticle } from './use-create-article';
import { articlesApi } from '../services/articles.api';
import { toast } from '@/lib/toast';

vi.mock('../services/articles.api', () => ({ articlesApi: { create: vi.fn() } }));
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

describe('useCreateArticle', () => {
  it('calls articlesApi.create with the input, invalidates the list, and toasts success', async () => {
    vi.mocked(articlesApi.create).mockResolvedValue({ id: 'a1' } as never);
    const { Wrapper, invalidateSpy } = wrapper();
    const { result } = renderHook(() => useCreateArticle(), { wrapper: Wrapper });

    const input = { title: 'Hello', body: { text: 'x' }, authorId: 'au1', language: 'en', locale: 'en-US' };
    result.current.mutate(input as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(articlesApi.create).toHaveBeenCalledWith(input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['articles', 'list'] });
    expect(toast.success).toHaveBeenCalledWith('Article created.');
  });
});
