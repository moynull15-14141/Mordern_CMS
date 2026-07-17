import { HttpStatus } from '@nestjs/common';
import {
  SeoArticleNotFoundException,
  SeoCategoryNotFoundException,
  SeoMetaAlreadyDeletedException,
  SeoMetaNotDeletedException,
  SeoMetaNotFoundException,
  SeoMetaNotLinkedException,
  SeoPageNotFoundException,
  SeoSiteNotFoundException,
  SeoValidationException,
} from './seo.exceptions';

describe('SEO exceptions', () => {
  it('SeoMetaNotFoundException carries a 404 status', () => {
    const err = new SeoMetaNotFoundException('seo-1');
    expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(err.message).toContain('seo-1');
  });

  it('SeoMetaAlreadyDeletedException carries a 409 status', () => {
    expect(new SeoMetaAlreadyDeletedException('seo-1').getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('SeoMetaNotDeletedException carries a 409 status', () => {
    expect(new SeoMetaNotDeletedException('seo-1').getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('SeoSiteNotFoundException carries a 404 status', () => {
    expect(new SeoSiteNotFoundException('site-1').getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('SeoArticleNotFoundException carries a 404 status', () => {
    expect(new SeoArticleNotFoundException('article-1').getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('SeoCategoryNotFoundException carries a 404 status', () => {
    expect(new SeoCategoryNotFoundException('category-1').getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('SeoPageNotFoundException carries a 404 status', () => {
    expect(new SeoPageNotFoundException('page-1').getStatus()).toBe(HttpStatus.NOT_FOUND);
  });

  it('SeoMetaNotLinkedException carries a 404 status and mentions the entity type', () => {
    const err = new SeoMetaNotLinkedException('article', 'article-1');
    expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(err.message).toContain('Article');
    expect(err.message).toContain('article-1');
  });

  it('SeoMetaNotLinkedException works for category and page too', () => {
    expect(new SeoMetaNotLinkedException('category', 'c1').message).toContain('Category');
    expect(new SeoMetaNotLinkedException('page', 'p1').message).toContain('Page');
  });

  it('SeoValidationException carries a 400 status and a code', () => {
    const err = new SeoValidationException('bad field');
    expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(err.code).toBeDefined();
  });
});
