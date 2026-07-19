import { describe, expect, it } from 'vitest';
import { matchContentRoute } from './route-shape.util';

describe('matchContentRoute', () => {
  it('matches /blog/{slug} as an article', () => {
    expect(matchContentRoute('/blog/hello-world')).toEqual({
      type: 'article',
      slug: 'hello-world',
    });
  });

  it('matches /category/{slug}', () => {
    expect(matchContentRoute('/category/football')).toEqual({
      type: 'category',
      slug: 'football',
    });
  });

  it('matches /page/{slug}', () => {
    expect(matchContentRoute('/page/about-us')).toEqual({ type: 'page', slug: 'about-us' });
  });

  it('returns null for an unrecognized prefix', () => {
    expect(matchContentRoute('/search')).toBeNull();
  });

  it('returns null for the root path (handled by the home resolver, not this matcher)', () => {
    expect(matchContentRoute('/')).toBeNull();
  });

  it('returns null for /blog with no slug (handled by the blog-list resolver, not this matcher)', () => {
    expect(matchContentRoute('/blog')).toBeNull();
  });

  it('returns null for a path with too many segments', () => {
    expect(matchContentRoute('/blog/one/two')).toBeNull();
  });
});
