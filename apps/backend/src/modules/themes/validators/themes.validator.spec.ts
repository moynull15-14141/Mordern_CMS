import { ThemesValidator } from './themes.validator';
import { ThemeSlugValidationException } from '../exceptions/theme.exceptions';

describe('ThemesValidator', () => {
  const validator = new ThemesValidator();

  describe('validateSlugShape', () => {
    it('accepts a valid slug', () => {
      expect(() => validator.validateSlugShape('classic-theme')).not.toThrow();
    });

    it('rejects a too-short slug', () => {
      expect(() => validator.validateSlugShape('ab')).toThrow(ThemeSlugValidationException);
    });

    it('rejects a slug with uppercase characters', () => {
      expect(() => validator.validateSlugShape('Classic-Theme')).toThrow(
        ThemeSlugValidationException
      );
    });

    it('rejects a slug with underscores', () => {
      expect(() => validator.validateSlugShape('classic_theme')).toThrow(
        ThemeSlugValidationException
      );
    });

    it('rejects a slug over the max length', () => {
      expect(() => validator.validateSlugShape('a'.repeat(201))).toThrow(
        ThemeSlugValidationException
      );
    });
  });
});
