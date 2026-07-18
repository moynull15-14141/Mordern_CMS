import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { toast } from '@/lib/toast';
import { commentsApi } from '../services/comments.api';
import { useCreateComment } from './use-create-comment';
import { useUpdateComment } from './use-update-comment';
import { useDeleteComment } from './use-delete-comment';
import { useRestoreComment } from './use-restore-comment';
import { useApproveComment } from './use-approve-comment';
import { useRejectComment } from './use-reject-comment';
import { useSpamComment } from './use-spam-comment';

vi.mock('../services/comments.api', () => ({
  commentsApi: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    restore: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    spam: vi.fn(),
  },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  return {
    Wrapper: function Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
    invalidateSpy,
  };
}

describe('comment mutations', () => {
  it('creates a comment and refreshes the article comments cache', async () => {
    vi.mocked(commentsApi.create).mockResolvedValue({ id: 'c1' } as never);
    const { Wrapper, invalidateSpy } = makeWrapper();
    const { result } = renderHook(() => useCreateComment(), { wrapper: Wrapper });

    result.current.mutate({ articleId: 'article-1', body: 'Hello' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsApi.create).toHaveBeenCalledWith({ articleId: 'article-1', body: 'Hello' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'list'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'article', 'article-1'] });
    expect(toast.success).toHaveBeenCalledWith('Comment created.');
  });

  it('updates a comment and refreshes the article subtree', async () => {
    vi.mocked(commentsApi.update).mockResolvedValue({ id: 'c1' } as never);
    const { Wrapper, invalidateSpy } = makeWrapper();
    const { result } = renderHook(() => useUpdateComment('c1', 'article-1'), { wrapper: Wrapper });

    result.current.mutate({ body: 'Updated' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsApi.update).toHaveBeenCalledWith('c1', { body: 'Updated' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'detail', 'c1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'article', 'article-1'] });
  });

  it('deletes a comment', async () => {
    vi.mocked(commentsApi.remove).mockResolvedValue({ id: 'c1' } as never);
    const { Wrapper, invalidateSpy } = makeWrapper();
    const { result } = renderHook(() => useDeleteComment('article-1'), { wrapper: Wrapper });

    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsApi.remove).toHaveBeenCalledWith('c1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'article', 'article-1'] });
  });

  it('restores a comment', async () => {
    vi.mocked(commentsApi.restore).mockResolvedValue({ id: 'c1' } as never);
    const { Wrapper, invalidateSpy } = makeWrapper();
    const { result } = renderHook(() => useRestoreComment('article-1'), { wrapper: Wrapper });

    result.current.mutate('c1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsApi.restore).toHaveBeenCalledWith('c1');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'article', 'article-1'] });
  });

  it('approves a comment', async () => {
    vi.mocked(commentsApi.approve).mockResolvedValue({ id: 'c1' } as never);
    const { Wrapper, invalidateSpy } = makeWrapper();
    const { result } = renderHook(() => useApproveComment('article-1'), { wrapper: Wrapper });

    result.current.mutate({ id: 'c1', input: { reason: 'ok' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsApi.approve).toHaveBeenCalledWith('c1', { reason: 'ok' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'article', 'article-1'] });
  });

  it('rejects a comment', async () => {
    vi.mocked(commentsApi.reject).mockResolvedValue({ id: 'c1' } as never);
    const { Wrapper, invalidateSpy } = makeWrapper();
    const { result } = renderHook(() => useRejectComment('article-1'), { wrapper: Wrapper });

    result.current.mutate({ id: 'c1', input: { reason: 'bad' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsApi.reject).toHaveBeenCalledWith('c1', { reason: 'bad' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'article', 'article-1'] });
  });

  it('marks a comment as spam', async () => {
    vi.mocked(commentsApi.spam).mockResolvedValue({ id: 'c1' } as never);
    const { Wrapper, invalidateSpy } = makeWrapper();
    const { result } = renderHook(() => useSpamComment('article-1'), { wrapper: Wrapper });

    result.current.mutate({ id: 'c1', input: { reason: 'spam' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(commentsApi.spam).toHaveBeenCalledWith('c1', { reason: 'spam' });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['comments', 'article', 'article-1'] });
  });
});
