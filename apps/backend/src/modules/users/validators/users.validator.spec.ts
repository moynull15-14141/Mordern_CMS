import { BusinessException } from '../../../core/exceptions/business.exception';
import { ProfileVisibility, ThemePreference } from '../constants/user.constants';
import { UsersValidator } from './users.validator';

describe('UsersValidator', () => {
  const validator = new UsersValidator();

  describe('validateProfile', () => {
    it('accepts an empty patch', () => {
      expect(() => validator.validateProfile({})).not.toThrow();
    });

    it('rejects an invalid phone number', () => {
      expect(() => validator.validateProfile({ phone: 'abc' })).toThrow(BusinessException);
    });

    it('accepts a valid phone number', () => {
      expect(() => validator.validateProfile({ phone: '+1 (555) 123-4567' })).not.toThrow();
    });

    it('rejects an invalid website URL', () => {
      expect(() => validator.validateProfile({ website: 'not-a-url' })).toThrow(BusinessException);
    });

    it('accepts a valid website URL', () => {
      expect(() => validator.validateProfile({ website: 'https://example.com' })).not.toThrow();
    });

    it('rejects an invalid language code', () => {
      expect(() => validator.validateProfile({ language: 'english' })).toThrow(BusinessException);
    });

    it('accepts a valid language code', () => {
      expect(() => validator.validateProfile({ language: 'en-US' })).not.toThrow();
    });

    it('rejects an invalid profileVisibility', () => {
      expect(() =>
        validator.validateProfile({ profileVisibility: 'HIDDEN' as unknown as ProfileVisibility })
      ).toThrow(BusinessException);
    });

    it('accepts a valid profileVisibility', () => {
      expect(() =>
        validator.validateProfile({ profileVisibility: ProfileVisibility.PRIVATE })
      ).not.toThrow();
    });
  });

  describe('validatePreferences', () => {
    it('accepts an empty patch', () => {
      expect(() => validator.validatePreferences({})).not.toThrow();
    });

    it('rejects an invalid theme', () => {
      expect(() =>
        validator.validatePreferences({ theme: 'NEON' as unknown as ThemePreference })
      ).toThrow(BusinessException);
    });

    it('accepts a valid theme', () => {
      expect(() => validator.validatePreferences({ theme: ThemePreference.DARK })).not.toThrow();
    });

    it('rejects a non-object editorPreference', () => {
      expect(() =>
        validator.validatePreferences({
          editorPreference: 'not-an-object' as unknown as Record<string, unknown>,
        })
      ).toThrow(BusinessException);
    });

    it('accepts an object editorPreference', () => {
      expect(() =>
        validator.validatePreferences({ editorPreference: { fontSize: 14 } })
      ).not.toThrow();
    });

    it('rejects an array as accessibilityPreference (arrays are not plain objects)', () => {
      expect(() =>
        validator.validatePreferences({
          accessibilityPreference: [1, 2] as unknown as Record<string, unknown>,
        })
      ).toThrow(BusinessException);
    });
  });
});
