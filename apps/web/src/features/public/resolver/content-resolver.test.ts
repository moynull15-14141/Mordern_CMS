import { describe, expect, it, vi } from 'vitest';
import { resolveContent } from './content-resolver';
import * as contentLoader from '../services/content-loader.service';
import { PublicApiError } from '../utils/errors';

describe('resolveContent', () => {
  it('resolves to not-found for an unrecognized URL shape', async () => {
    const result = await resolveContent('/search');
    expect(result).toEqual({ type: 'not-found', path: '/search' });
  });

  it('resolves to not-found when the page loader 404s (unknown/unpublished slug)', async () => {
    vi.spyOn(contentLoader, 'getPageBySlug').mockRejectedValueOnce(
      new PublicApiError({
        message: 'Page "nope" was not found.',
        code: 'BUSINESS_NOT_FOUND',
        status: 404,
      })
    );

    const result = await resolveContent('/page/nope');
    expect(result).toEqual({ type: 'not-found', path: '/page/nope' });
  });

  it('resolves a /blog/{slug} URL to a real article via getArticleBySlug', async () => {
    vi.spyOn(contentLoader, 'getArticleBySlug').mockResolvedValueOnce({
      type: 'article',
      title: 'Match Report',
      subtitle: null,
      slug: 'match-report',
      summary: null,
      publishedAt: '2026-01-01T00:00:00.000Z',
      readingTime: 3,
      author: { penName: 'Jane Doe' },
      category: null,
      tags: [],
      body: {},
      wordCount: 500,
      language: 'en',
      locale: 'en-US',
      canonicalUrl: null,
      seo: null,
    });

    const result = await resolveContent('/blog/match-report');
    expect(contentLoader.getArticleBySlug).toHaveBeenCalledWith('match-report');
    expect(result).toMatchObject({ type: 'article', slug: 'match-report' });
  });

  it('resolves a real page for /page/{slug}', async () => {
    vi.spyOn(contentLoader, 'getPageBySlug').mockResolvedValueOnce({
      type: 'page',
      title: 'About',
      slug: 'about-us',
      body: {},
      publishedAt: '2026-01-01T00:00:00.000Z',
      seo: null,
    });

    const result = await resolveContent('/page/about-us');
    expect(result).toMatchObject({ type: 'page', slug: 'about-us' });
  });

  it('resolves a real category for /category/{slug}', async () => {
    vi.spyOn(contentLoader, 'getCategoryBySlug').mockResolvedValueOnce({
      type: 'category',
      name: 'Football',
      slug: 'football',
      description: null,
      articleCount: 4,
      seo: null,
    });

    const result = await resolveContent('/category/football');
    expect(result).toMatchObject({ type: 'category', slug: 'football' });
  });

  it('propagates a non-404 error (real failure, not "content missing")', async () => {
    // Deliberately a distinct pathname from every other test in this file —
    // `resolveContent` is `cache()`-wrapped (keyed on its `pathname`
    // argument), so reusing a pathname another test already resolved
    // would return that cached result instead of exercising this mock.
    vi.spyOn(contentLoader, 'getPageBySlug').mockRejectedValueOnce(
      new PublicApiError({ message: 'Network error', code: 'NETWORK_ERROR' })
    );

    await expect(resolveContent('/page/broken-page')).rejects.toThrow(PublicApiError);
  });
});
