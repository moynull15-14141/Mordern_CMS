import { Injectable } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { SettingsService } from '../../settings/services/settings.service';
import { MEDIA_TYPE_MIME_PREFIX } from '../constants/media.constants';
import { MediaValidationException } from '../exceptions/media.exceptions';

const BYTES_PER_MB = 1024 * 1024;

/**
 * Registration-time metadata validation — no file bytes are ever read (no
 * upload engine exists in this milestone). Reuses the existing Settings
 * foundation (`SettingCategory.MEDIA`'s `maxUploadSizeMb`/`allowedMimeTypes`,
 * Milestone 6) instead of hardcoding or duplicating limits — see
 * docs/48_MEDIA_LIBRARY_ARCHITECTURE.md "Validation".
 */
@Injectable()
export class MediaValidator {
  constructor(private readonly settingsService: SettingsService) {}

  async assertFilesizeWithinLimit(filesize: bigint): Promise<void> {
    const setting = await this.settingsService.getByKey('media.maxUploadSizeMb');
    const maxMb = Number(setting.value);
    const maxBytes = BigInt(Math.round(maxMb * BYTES_PER_MB));
    if (filesize > maxBytes) {
      throw new MediaValidationException(`File size exceeds the configured maximum of ${maxMb}MB.`);
    }
    if (filesize <= 0n) {
      throw new MediaValidationException('File size must be greater than zero.');
    }
  }

  async assertMimeTypeAllowed(mimeType: string): Promise<void> {
    const setting = await this.settingsService.getByKey('media.allowedMimeTypes');
    const allowed = (setting.value as string[] | null) ?? [];
    if (allowed.length > 0 && !allowed.includes(mimeType)) {
      throw new MediaValidationException(
        `MIME type "${mimeType}" is not in the allowed list: [${allowed.join(', ')}].`
      );
    }
  }

  /** Cross-field consistency check only (declared `type` vs declared
   * `mimeType`) — not real content-sniffing. DOCUMENT has no fixed prefix,
   * so it always passes. */
  assertMimeTypeMatchesType(type: MediaType, mimeType: string): void {
    const expectedPrefix = MEDIA_TYPE_MIME_PREFIX[type];
    if (expectedPrefix && !mimeType.startsWith(expectedPrefix)) {
      throw new MediaValidationException(
        `mimeType "${mimeType}" is not consistent with declared type "${type}".`
      );
    }
  }

  assertStorageKeyShape(storageKey: string): void {
    const trimmed = storageKey.trim();
    if (trimmed.length === 0) {
      throw new MediaValidationException('storageKey must not be empty.');
    }
    if (trimmed.includes('..') || trimmed.startsWith('/')) {
      throw new MediaValidationException(
        'storageKey must not contain path traversal segments or a leading slash.'
      );
    }
  }
}
