import { MediaType } from '@prisma/client';
import { SettingsService } from '../../settings/services/settings.service';
import { MediaValidationException } from '../exceptions/media.exceptions';
import { MediaValidator } from './media.validator';

function buildValidator(settingValues: Record<string, unknown>) {
  const settingsService = {
    getByKey: jest.fn((key: string) => Promise.resolve({ value: settingValues[key] })),
  } as unknown as SettingsService;
  return { validator: new MediaValidator(settingsService), settingsService };
}

describe('MediaValidator', () => {
  describe('assertFilesizeWithinLimit', () => {
    it('accepts a filesize within the configured max', async () => {
      const { validator } = buildValidator({ 'media.maxUploadSizeMb': 25 });
      await expect(validator.assertFilesizeWithinLimit(10n * 1024n * 1024n)).resolves.not.toThrow();
    });

    it('rejects a filesize exceeding the configured max', async () => {
      const { validator } = buildValidator({ 'media.maxUploadSizeMb': 25 });
      await expect(validator.assertFilesizeWithinLimit(30n * 1024n * 1024n)).rejects.toThrow(
        MediaValidationException
      );
    });

    it('rejects a zero filesize', async () => {
      const { validator } = buildValidator({ 'media.maxUploadSizeMb': 25 });
      await expect(validator.assertFilesizeWithinLimit(0n)).rejects.toThrow(
        MediaValidationException
      );
    });

    it('reads the limit from Settings, not a hardcoded value', async () => {
      const { validator, settingsService } = buildValidator({ 'media.maxUploadSizeMb': 25 });
      await validator.assertFilesizeWithinLimit(1n);
      expect(settingsService.getByKey).toHaveBeenCalledWith('media.maxUploadSizeMb');
    });
  });

  describe('assertMimeTypeAllowed', () => {
    it('accepts a mimeType in the allowed list', async () => {
      const { validator } = buildValidator({
        'media.allowedMimeTypes': ['image/png', 'image/jpeg'],
      });
      await expect(validator.assertMimeTypeAllowed('image/png')).resolves.not.toThrow();
    });

    it('rejects a mimeType not in the allowed list', async () => {
      const { validator } = buildValidator({ 'media.allowedMimeTypes': ['image/png'] });
      await expect(validator.assertMimeTypeAllowed('video/mp4')).rejects.toThrow(
        MediaValidationException
      );
    });

    it('allows any mimeType when the allowed list is empty', async () => {
      const { validator } = buildValidator({ 'media.allowedMimeTypes': [] });
      await expect(validator.assertMimeTypeAllowed('anything/whatever')).resolves.not.toThrow();
    });
  });

  describe('assertMimeTypeMatchesType', () => {
    const { validator } = buildValidator({});

    it('accepts image/* for IMAGE', () => {
      expect(() => validator.assertMimeTypeMatchesType(MediaType.IMAGE, 'image/png')).not.toThrow();
    });

    it('rejects video/* for IMAGE', () => {
      expect(() => validator.assertMimeTypeMatchesType(MediaType.IMAGE, 'video/mp4')).toThrow(
        MediaValidationException
      );
    });

    it('accepts video/* for VIDEO', () => {
      expect(() => validator.assertMimeTypeMatchesType(MediaType.VIDEO, 'video/mp4')).not.toThrow();
    });

    it('accepts audio/* for AUDIO', () => {
      expect(() =>
        validator.assertMimeTypeMatchesType(MediaType.AUDIO, 'audio/mpeg')
      ).not.toThrow();
    });

    it('accepts any mimeType for DOCUMENT (no fixed prefix)', () => {
      expect(() =>
        validator.assertMimeTypeMatchesType(MediaType.DOCUMENT, 'application/pdf')
      ).not.toThrow();
      expect(() =>
        validator.assertMimeTypeMatchesType(MediaType.DOCUMENT, 'text/plain')
      ).not.toThrow();
    });
  });

  describe('assertStorageKeyShape', () => {
    const { validator } = buildValidator({});

    it('accepts a normal key', () => {
      expect(() => validator.assertStorageKeyShape('uploads/2026/photo.png')).not.toThrow();
    });

    it('rejects an empty key', () => {
      expect(() => validator.assertStorageKeyShape('   ')).toThrow(MediaValidationException);
    });

    it('rejects a key with path traversal', () => {
      expect(() => validator.assertStorageKeyShape('../../etc/passwd')).toThrow(
        MediaValidationException
      );
    });

    it('rejects a key with a leading slash', () => {
      expect(() => validator.assertStorageKeyShape('/etc/passwd')).toThrow(
        MediaValidationException
      );
    });
  });
});
