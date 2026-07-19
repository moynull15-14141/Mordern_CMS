import { LayoutsValidator } from './layouts.validator';
import { LayoutSlugValidationException } from '../exceptions/layout.exceptions';

describe('LayoutsValidator', () => {
  describe('validateSlugShape', () => {
    it('accepts a well-formed slug', () => {
      const validator = new LayoutsValidator();
      expect(() => validator.validateSlugShape('sidebar-left')).not.toThrow();
    });

    it('rejects a slug shorter than the minimum length', () => {
      const validator = new LayoutsValidator();
      expect(() => validator.validateSlugShape('ab')).toThrow(LayoutSlugValidationException);
    });

    it('rejects a slug with invalid characters', () => {
      const validator = new LayoutsValidator();
      expect(() => validator.validateSlugShape('Sidebar_Left!')).toThrow(
        LayoutSlugValidationException
      );
    });
  });

  describe('validateLayoutPreset', () => {
    it('does not throw for a known preset', () => {
      const validator = new LayoutsValidator();
      expect(() => validator.validateLayoutPreset('sidebar-left')).not.toThrow();
    });

    it('does not throw for an unrecognized preset either — open-ended field, warning only', () => {
      const validator = new LayoutsValidator();
      expect(() => validator.validateLayoutPreset('some-future-preset')).not.toThrow();
    });
  });
});
