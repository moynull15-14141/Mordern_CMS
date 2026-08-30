import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveContent } from './content-resolver';
import * as contentLoader from '../services/content-loader.service';
import * as redirectsService from '../services/redirects.service';
import * as nextNavigation from 'next/navigation';
import { PublicApiError } from '../utils/errors';

vi.mock('../services/redirects.service', () => ({ getRedirectForPath: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
  permanentRedirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

beforeEach(() => {
  vi.mocked(redirectsService.getRedirectForPath).mockReset();
  vi.mocked(redirectsService.getRedirectForPath).mockResolvedValue(null);
  vi.mocked(nextNavigation.redirect).mockClear();
  vi.mocked(nextNavigation.permanentRedirect).mockClear();
});

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

  it('issues a temporary redirect (307) when a 302 redirect is configured for a 404 path', async () => {
    vi.spyOn(contentLoader, 'getPageBySlug').mockRejectedValueOnce(
      new PublicApiError({ message: 'not found', code: 'BUSINESS_NOT_FOUND', status: 404 })
    );
    vi.mocked(redirectsService.getRedirectForPath).mockResolvedValueOnce({
      destinationUrl: '/page/new-about',
      redirectType: 302,
    });

    await expect(resolveContent('/page/old-about')).rejects.toThrow('NEXT_REDIRECT');
    expect(nextNavigation.redirect).toHaveBeenCalledWith('/page/new-about');
    expect(nextNavigation.permanentRedirect).not.toHaveBeenCalled();
  });

  it('issues a permanent redirect (308) when a 301 redirect is configured for a 404 path', async () => {
    vi.spyOn(contentLoader, 'getPageBySlug').mockRejectedValueOnce(
      new PublicApiError({ message: 'not found', code: 'BUSINESS_NOT_FOUND', status: 404 })
    );
    vi.mocked(redirectsService.getRedirectForPath).mockResolvedValueOnce({
      destinationUrl: '/page/moved-about',
      redirectType: 301,
    });

    await expect(resolveContent('/page/ancient-about')).rejects.toThrow('NEXT_REDIRECT');
    expect(nextNavigation.permanentRedirect).toHaveBeenCalledWith('/page/moved-about');
  });

  it('falls through to not-found when no redirect is configured for an unmatched URL shape', async () => {
    vi.mocked(redirectsService.getRedirectForPath).mockResolvedValueOnce(null);
    const result = await resolveContent('/some-random-unmatched-path');
    expect(result).toEqual({ type: 'not-found', path: '/some-random-unmatched-path' });
    expect(nextNavigation.redirect).not.toHaveBeenCalled();
  });
});
