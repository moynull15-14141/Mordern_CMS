import { isPublicSeoEntityType } from './public-seo-entity-type';

describe('isPublicSeoEntityType', () => {
  it('returns true for page/article/category', () => {
    expect(isPublicSeoEntityType('page')).toBe(true);
    expect(isPublicSeoEntityType('article')).toBe(true);
    expect(isPublicSeoEntityType('category')).toBe(true);
  });

  it('returns false for an unrecognized entity type', () => {
    expect(isPublicSeoEntityType('menu')).toBe(false);
    expect(isPublicSeoEntityType('')).toBe(false);
    expect(isPublicSeoEntityType('Page')).toBe(false);
  });
});
