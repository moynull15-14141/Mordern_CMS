import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { usePageBuilderBlocks } from './use-page-builder-blocks';
import { pagesApi } from '@/features/pages/services/pages.api';
import type { Page } from '@/features/pages/types/page';

vi.mock('@/features/pages/services/pages.api', () => ({ pagesApi: { update: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function buildPage(overrides: Partial<Page> = {}): Page {
  return {
    id: 'page-1',
    title: 'About',
    slug: 'about',
    body: { blocks: [{ id: 'a', type: 'paragraph', data: {} }] },
    status: 'DRAFT',
    publishedAt: null,
    seo: null,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    ...overrides,
  };
}

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('usePageBuilderBlocks', () => {
  it('seeds blocks from the page body and starts idle', () => {
    const { result } = renderHook(() => usePageBuilderBlocks(buildPage()), { wrapper: wrapper() });
    expect(result.current.blocks).toEqual([{ id: 'a', type: 'paragraph', data: {} }]);
    expect(result.current.status).toBe('idle');
  });

  it('degrades a malformed body to an empty block list', () => {
    const { result } = renderHook(
      () => usePageBuilderBlocks(buildPage({ body: { not: 'blocks' } })),
      {
        wrapper: wrapper(),
      }
    );
    expect(result.current.blocks).toEqual([]);
  });

  it('setBlocks marks unsaved immediately, then autosaves after the debounce window', async () => {
    vi.mocked(pagesApi.update).mockResolvedValue(buildPage());
    const { result } = renderHook(() => usePageBuilderBlocks(buildPage()), { wrapper: wrapper() });

    act(() => {
      result.current.setBlocks([{ id: 'b', type: 'paragraph', data: { text: 'new' } }]);
    });
    expect(result.current.status).toBe('unsaved');
    expect(pagesApi.update).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(pagesApi.update).toHaveBeenCalledWith('page-1', {
      body: { blocks: [{ id: 'b', type: 'paragraph', data: { text: 'new' } }] },
    });
    expect(result.current.status).toBe('saved');
  });

  it('rapid successive edits within the debounce window collapse into a single save call', async () => {
    vi.mocked(pagesApi.update).mockResolvedValue(buildPage());
    const { result } = renderHook(() => usePageBuilderBlocks(buildPage()), { wrapper: wrapper() });

    act(() => {
      result.current.setBlocks([{ id: 'x', type: 'paragraph', data: {} }]);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
      result.current.setBlocks([{ id: 'x', type: 'paragraph', data: { text: '1' } }]);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
      result.current.setBlocks([{ id: 'x', type: 'paragraph', data: { text: '12' } }]);
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(pagesApi.update).toHaveBeenCalledTimes(1);
    expect(pagesApi.update).toHaveBeenCalledWith('page-1', {
      body: { blocks: [{ id: 'x', type: 'paragraph', data: { text: '12' } }] },
    });
  });

  it('saveNow flushes immediately without waiting for the debounce', async () => {
    vi.mocked(pagesApi.update).mockResolvedValue(buildPage());
    const { result } = renderHook(() => usePageBuilderBlocks(buildPage()), { wrapper: wrapper() });

    act(() => {
      result.current.setBlocks([{ id: 'c', type: 'paragraph', data: {} }]);
    });
    await act(async () => {
      result.current.saveNow();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(pagesApi.update).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('saved');
  });

  it('sets status to error when the save fails', async () => {
    vi.mocked(pagesApi.update).mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => usePageBuilderBlocks(buildPage()), { wrapper: wrapper() });

    await act(async () => {
      result.current.saveNow();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.status).toBe('error');
  });
});
