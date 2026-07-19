import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadHomeContent } from './load-home-content';
import * as contentLoader from '../services/content-loader.service';

describe('loadHomeContent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches latest (page 1) and featured (page 2) articles, plus categories, in parallel', async () => {
    const listArticlesSpy = vi
      .spyOn(contentLoader, 'listArticles')
      .mockResolvedValueOnce({
        articles: [{ slug: 'latest-1' } as never],
        pagination: { page: 1, limit: 6, total: 10, hasNext: true, hasPrevious: false },
      })
      .mockResolvedValueOnce({
        articles: [{ slug: 'featured-1' } as never],
        pagination: { page: 2, limit: 3, total: 10, hasNext: true, hasPrevious: true },
      });
    vi.spyOn(contentLoader, 'listCategories').mockResolvedValueOnce({
      categories: [
        {
          type: 'category',
          name: 'Football',
          slug: 'football',
          description: null,
          articleCount: 1,
          seo: null,
        },
      ],
      pagination: { page: 1, limit: 6, total: 1, hasNext: false, hasPrevious: false },
    });

    const result = await loadHomeContent();

    expect(result.type).toBe('home');
    expect(result.latestArticles).toEqual([{ slug: 'latest-1' }]);
    expect(result.featuredArticles).toEqual([{ slug: 'featured-1' }]);
    expect(result.categories).toHaveLength(1);

    expect(listArticlesSpy).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 6,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
    expect(listArticlesSpy).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: 3,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
  });
});
