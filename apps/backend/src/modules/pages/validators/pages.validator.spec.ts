import { PagesValidator } from './pages.validator';
import { PageSlugValidationException } from '../exceptions/page.exceptions';
import { PageInvalidStatusTransitionException } from '../exceptions/page.exceptions';
import { ContentStatus } from '@prisma/client';

describe('PagesValidator.validateSlugShape', () => {
  const validator = new PagesValidator();

  it('accepts a normal, valid slug', () => {
    expect(() => validator.validateSlugShape('about-us')).not.toThrow();
  });

  it('rejects a slug shorter than the minimum length', () => {
    expect(() => validator.validateSlugShape('ab')).toThrow(PageSlugValidationException);
  });

  it('rejects a slug with uppercase letters', () => {
    expect(() => validator.validateSlugShape('About-Us')).toThrow(PageSlugValidationException);
  });

  it('rejects a slug with consecutive hyphens', () => {
    expect(() => validator.validateSlugShape('about--us')).toThrow(PageSlugValidationException);
  });

  it.each(['admin', 'api', 'sitemap', 'robots.txt', 'preview'])(
    'rejects the reserved slug "%s"',
    (slug) => {
      expect(() => validator.validateSlugShape(slug)).toThrow(PageSlugValidationException);
    }
  );

  it('allows a slug that merely contains a reserved word as part of a longer word', () => {
    // "admins-guide" is not the reserved word "admin" — only an exact
    // match is rejected, not a substring.
    expect(() => validator.validateSlugShape('admins-guide')).not.toThrow();
  });
});

describe('PagesValidator.assertGenericUpdateStatus', () => {
  const validator = new PagesValidator();

  it('allows DRAFT/REVIEW/ARCHIVED', () => {
    expect(() => validator.assertGenericUpdateStatus(ContentStatus.DRAFT)).not.toThrow();
    expect(() => validator.assertGenericUpdateStatus(ContentStatus.REVIEW)).not.toThrow();
    expect(() => validator.assertGenericUpdateStatus(ContentStatus.ARCHIVED)).not.toThrow();
  });

  it('rejects PUBLISHED via the generic update path', () => {
    expect(() => validator.assertGenericUpdateStatus(ContentStatus.PUBLISHED)).toThrow(
      PageInvalidStatusTransitionException
    );
  });

  it('allows undefined (status not being changed)', () => {
    expect(() => validator.assertGenericUpdateStatus(undefined)).not.toThrow();
  });
});
