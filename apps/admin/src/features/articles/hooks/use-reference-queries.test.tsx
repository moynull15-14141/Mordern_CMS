import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useArticleRevisions } from './use-article-revisions';
import { useCategoryOptions } from './use-category-options';
import { useTagOptions } from './use-tag-options';
import { articlesApi } from '../services/articles.api';
import { categoriesApi } from '../services/categories.api';
import { tagsApi } from '../services/tags.api';

vi.mock('../services/articles.api', () => ({ articlesApi: { listRevisions: vi.fn() } }));
vi.mock('../services/categories.api', () => ({ categoriesApi: { listFlat: vi.fn() } }));
vi.mock('../services/tags.api', () => ({ tagsApi: { list: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useArticleRevisions', () => {
  it('calls articlesApi.listRevisions with the article id', async () => {
    vi.mocked(articlesApi.listRevisions).mockResolvedValue([]);
    const { result } = renderHook(() => useArticleRevisions('a1'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(articlesApi.listRevisions).toHaveBeenCalledWith('a1');
  });
});

describe('useCategoryOptions', () => {
  it('calls categoriesApi.listFlat with no arguments', async () => {
    vi.mocked(categoriesApi.listFlat).mockResolvedValue([]);
    const { result } = renderHook(() => useCategoryOptions(), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(categoriesApi.listFlat).toHaveBeenCalledWith();
  });
});

describe('useTagOptions', () => {
  it('calls tagsApi.list with the given search term', async () => {
    vi.mocked(tagsApi.list).mockResolvedValue({ data: [], meta: {} });
    const { result } = renderHook(() => useTagOptions('news'), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(tagsApi.list).toHaveBeenCalledWith('news');
  });
});
