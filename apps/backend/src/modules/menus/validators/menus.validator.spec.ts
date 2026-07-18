import { MenusValidator } from './menus.validator';
import {
  InvalidMenuItemTargetException,
  MenuSlugValidationException,
} from '../exceptions/menu.exceptions';

describe('MenusValidator', () => {
  const validator = new MenusValidator();

  describe('validateSlugShape', () => {
    it('accepts a valid slug', () => {
      expect(() => validator.validateSlugShape('header-menu')).not.toThrow();
    });

    it('rejects a too-short slug', () => {
      expect(() => validator.validateSlugShape('ab')).toThrow(MenuSlugValidationException);
    });

    it('rejects a slug with invalid characters', () => {
      expect(() => validator.validateSlugShape('Header_Menu')).toThrow(MenuSlugValidationException);
    });
  });

  describe('validateItemTarget', () => {
    it('accepts PAGE targetType with only pageId set', () => {
      expect(() =>
        validator.validateItemTarget({ targetType: 'PAGE', pageId: 'p1' })
      ).not.toThrow();
    });

    it('rejects PAGE targetType with no pageId set', () => {
      expect(() => validator.validateItemTarget({ targetType: 'PAGE' })).toThrow(
        InvalidMenuItemTargetException
      );
    });

    it('rejects PAGE targetType with both pageId and url set', () => {
      expect(() =>
        validator.validateItemTarget({ targetType: 'PAGE', pageId: 'p1', url: 'https://x.com' })
      ).toThrow(InvalidMenuItemTargetException);
    });

    it('accepts EXTERNAL_URL targetType with only url set', () => {
      expect(() =>
        validator.validateItemTarget({ targetType: 'EXTERNAL_URL', url: 'https://x.com' })
      ).not.toThrow();
    });

    it('rejects EXTERNAL_URL targetType with pageId set instead of url', () => {
      expect(() =>
        validator.validateItemTarget({ targetType: 'EXTERNAL_URL', pageId: 'p1' })
      ).toThrow(InvalidMenuItemTargetException);
    });

    it('rejects when nothing at all is set', () => {
      expect(() => validator.validateItemTarget({ targetType: 'CUSTOM_URL' })).toThrow(
        InvalidMenuItemTargetException
      );
    });
  });

  describe('assertNotSelfParent', () => {
    it('returns true when itemId equals parentId', () => {
      expect(validator.assertNotSelfParent('a', 'a')).toBe(true);
    });

    it('returns false when itemId differs from parentId', () => {
      expect(validator.assertNotSelfParent('a', 'b')).toBe(false);
    });
  });

  describe('assertNoCircularReference', () => {
    it('delegates to wouldCreateCycle', () => {
      const items = [
        { id: 'a', parentId: null, sortOrder: 0 },
        { id: 'b', parentId: 'a', sortOrder: 0 },
      ] as never;
      expect(validator.assertNoCircularReference(items, 'a', 'b')).toBe(true);
    });
  });
});
