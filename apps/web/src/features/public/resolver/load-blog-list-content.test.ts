import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadBlogListContent } from './load-blog-list-content';
import * as contentLoader from '../services/content-loader.service';

describe('loadBlogListContent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to page 1 when no page param is given', async () => {
    const spy = vi.spyOn(contentLoader, 'listArticles').mockResolvedValueOnce({
      articles: [],
      pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false },
    });

    const result = await loadBlogListContent(undefined, undefined);

    expect(spy).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
      search: undefined,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
    expect(result).toEqual({
      type: 'blog-list',
      articles: [],
      pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false },
      search: null,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
  });

  it('forwards a valid page param', async () => {
    const spy = vi.spyOn(contentLoader, 'listArticles').mockResolvedValueOnce({
      articles: [],
      pagination: { page: 3, limit: 12, total: 30, hasNext: true, hasPrevious: true },
    });

    await loadBlogListContent('3', undefined);

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }));
  });

  it('falls back to page 1 for a non-numeric or non-positive page param', async () => {
    const spy = vi.spyOn(contentLoader, 'listArticles').mockResolvedValue({
      articles: [],
      pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false },
    });

    await loadBlogListContent('not-a-number', undefined);
    await loadBlogListContent('-5', undefined);
    await loadBlogListContent('0', undefined);

    for (const call of spy.mock.calls) {
      expect(call[0]).toMatchObject({ page: 1 });
    }
  });

  it('trims and forwards a search term, and stores it on the result', async () => {
    const spy = vi.spyOn(contentLoader, 'listArticles').mockResolvedValueOnce({
      articles: [],
      pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false },
    });

    const result = await loadBlogListContent(undefined, '  derby  ');

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ search: 'derby' }));
    expect(result.search).toBe('derby');
  });

  it('treats a blank/whitespace-only search as no search', async () => {
    vi.spyOn(contentLoader, 'listArticles').mockResolvedValueOnce({
      articles: [],
      pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false },
    });

    const result = await loadBlogListContent(undefined, '   ');
    expect(result.search).toBeNull();
  });
});
