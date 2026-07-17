import { ContentStatus } from '@prisma/client';
import {
  InvalidStatusTransitionException,
  SlugValidationException,
} from '../exceptions/article.exceptions';
import { ArticlesValidator } from './articles.validator';

describe('ArticlesValidator', () => {
  const validator = new ArticlesValidator();

  describe('validateSlugShape', () => {
    it('accepts a valid normalized slug', () => {
      expect(() => validator.validateSlugShape('hello-world')).not.toThrow();
    });

    it('rejects a too-short slug', () => {
      expect(() => validator.validateSlugShape('ab')).toThrow(SlugValidationException);
    });

    it('rejects uppercase characters', () => {
      expect(() => validator.validateSlugShape('Hello-World')).toThrow(SlugValidationException);
    });

    it('rejects double hyphens', () => {
      expect(() => validator.validateSlugShape('hello--world')).toThrow(SlugValidationException);
    });

    it('rejects leading/trailing hyphens', () => {
      expect(() => validator.validateSlugShape('-hello-world-')).toThrow(SlugValidationException);
    });
  });

  describe('assertGenericUpdateStatus', () => {
    it('allows DRAFT/REVIEW/ARCHIVED', () => {
      expect(() => validator.assertGenericUpdateStatus(ContentStatus.DRAFT)).not.toThrow();
      expect(() => validator.assertGenericUpdateStatus(ContentStatus.REVIEW)).not.toThrow();
      expect(() => validator.assertGenericUpdateStatus(ContentStatus.ARCHIVED)).not.toThrow();
    });

    it('allows undefined (no status change)', () => {
      expect(() => validator.assertGenericUpdateStatus(undefined)).not.toThrow();
    });

    it('rejects PUBLISHED', () => {
      expect(() => validator.assertGenericUpdateStatus(ContentStatus.PUBLISHED)).toThrow(
        InvalidStatusTransitionException
      );
    });

    it('rejects SCHEDULED', () => {
      expect(() => validator.assertGenericUpdateStatus(ContentStatus.SCHEDULED)).toThrow(
        InvalidStatusTransitionException
      );
    });
  });

  describe('assertFutureDate', () => {
    it('accepts a future date', () => {
      expect(() =>
        validator.assertFutureDate(new Date(Date.now() + 60_000), 'scheduledAt')
      ).not.toThrow();
    });

    it('rejects a past date', () => {
      expect(() =>
        validator.assertFutureDate(new Date(Date.now() - 60_000), 'scheduledAt')
      ).toThrow(InvalidStatusTransitionException);
    });
  });
});
