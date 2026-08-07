import { Inject, Injectable } from '@nestjs/common';
import { MediaVisibility } from '@prisma/client';
import { AppConfigService } from '../../../config/config.service';
import type { StorageProvider } from '../../../core/interfaces/storage-provider.interface';
import { STORAGE_PROVIDER } from '../../../infrastructure/storage/storage.constants';

export interface ResolvedMediaUrls {
  original?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  webp?: string;
  avif?: string;
}

interface MediaVariantEntry {
  storageKey: string;
}

const VARIANT_NAMES = ['thumbnail', 'small', 'medium', 'large', 'webp', 'avif'] as const;

/**
 * Resolves storage keys → real, requestable URLs. `PUBLIC` assets join
 * `CDN_URL` directly (cheap, no signing); `PRIVATE` assets always go through
 * `StorageProvider.getSignedUrl` (TTL from `SIGNED_URL_TTL_SECONDS`). List
 * responses pass `includeOriginal: false` (avoid signing 20–50 URLs per
 * page load — see `MediaService.toResponseDtos`); single-asset `GET /:id`
 * and `GET /:id/signed-url` resolve eagerly.
 */
@Injectable()
export class MediaUrlResolverService {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly config: AppConfigService
  ) {}

  async resolveUrls(
    asset: { storageKey: string; visibility: MediaVisibility; variants: unknown },
    options?: { includeOriginal?: boolean }
  ): Promise<ResolvedMediaUrls> {
    const includeOriginal = options?.includeOriginal ?? true;
    const urls: ResolvedMediaUrls = {};

    if (includeOriginal) {
      urls.original = await this.resolveKey(asset.storageKey, asset.visibility);
    }

    const variants = (asset.variants as Record<string, MediaVariantEntry> | null) ?? {};
    await Promise.all(
      VARIANT_NAMES.map(async (name) => {
        const variant = variants[name];
        if (variant?.storageKey) {
          urls[name] = await this.resolveKey(variant.storageKey, asset.visibility);
        }
      })
    );

    return urls;
  }

  async resolveSignedUrl(storageKey: string): Promise<string> {
    return this.storage.getSignedUrl(storageKey, this.config.cdn.signedUrlTtlSeconds);
  }

  private async resolveKey(key: string, visibility: MediaVisibility): Promise<string> {
    if (visibility === MediaVisibility.PRIVATE) {
      return this.storage.getSignedUrl(key, this.config.cdn.signedUrlTtlSeconds);
    }
    const base = this.config.cdn.url?.replace(/\/+$/, '');
    if (base) {
      return `${base}/${key}`;
    }
    // No CDN configured — fall back to a signed URL even for a public asset.
    return this.storage.getSignedUrl(key, this.config.cdn.signedUrlTtlSeconds);
  }
}
