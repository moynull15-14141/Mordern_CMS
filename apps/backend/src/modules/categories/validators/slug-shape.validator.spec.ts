import { SlugValidationException } from '../exceptions/category.exceptions';
import { SlugShapeValidator } from './slug-shape.validator';

describe('SlugShapeValidator', () => {
  const validator = new SlugShapeValidator();

  it('accepts a valid normalized slug', () => {
    expect(() => validator.validateSlugShape('news')).not.toThrow();
  });

  it('accepts a valid multi-word slug', () => {
    expect(() => validator.validateSlugShape('breaking-news')).not.toThrow();
  });

  it('rejects a too-short slug', () => {
    expect(() => validator.validateSlugShape('a')).toThrow(SlugValidationException);
  });

  it('rejects uppercase characters', () => {
    expect(() => validator.validateSlugShape('News')).toThrow(SlugValidationException);
  });

  it('rejects double hyphens', () => {
    expect(() => validator.validateSlugShape('news--today')).toThrow(SlugValidationException);
  });

  it('rejects leading/trailing hyphens', () => {
    expect(() => validator.validateSlugShape('-news-')).toThrow(SlugValidationException);
  });

  it('rejects a too-long slug', () => {
    expect(() => validator.validateSlugShape('a'.repeat(201))).toThrow(SlugValidationException);
  });
});
