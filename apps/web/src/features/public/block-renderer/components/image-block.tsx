import type { BlockComponentProps } from '../types/block.types';
import { getMedia } from '../../services/media.service';

/**
 * Async Server Component (Milestone 5) — resolves `data.mediaId` via
 * `media.service.ts`'s `cache()`-wrapped `getMedia`, rendering a real
 * `<picture>` with AVIF/WebP sources and a blur-placeholder background.
 * Pre-existing content authored under the old `data.url` string shape
 * (before the admin property panel switched to media-ref-only) dual-reads:
 * `mediaId` first, falling back to the legacy `data.url` plain `<img>` when
 * `mediaId` is absent — no lossy data migration for that content.
 */
export async function ImageBlock({ block }: BlockComponentProps) {
  const mediaId = typeof block.data.mediaId === 'string' ? block.data.mediaId : '';
  const alt = typeof block.data.alt === 'string' ? block.data.alt : '';
  const caption = typeof block.data.caption === 'string' ? block.data.caption : '';

  if (mediaId) {
    const media = await getMedia(mediaId);
    if (!media) return null;
    const { urls, blurPlaceholder } = media;
    const src = urls.original ?? urls.large ?? urls.medium;
    if (!src) return null;

    return (
      <figure className="my-2">
        <picture>
          {urls.avif ? <source srcSet={urls.avif} type="image/avif" /> : null}
          {urls.webp ? <source srcSet={urls.webp} type="image/webp" /> : null}
          <img
            src={src}
            alt={alt || media.altText || ''}
            className="w-full rounded-[var(--sportingspy-radius,0.5rem)]"
            style={
              blurPlaceholder
                ? { backgroundImage: `url(${blurPlaceholder})`, backgroundSize: 'cover' }
                : undefined
            }
            loading="lazy"
          />
        </picture>
        {caption ? <figcaption className="mt-2 text-sm text-gray-500">{caption}</figcaption> : null}
      </figure>
    );
  }

  const url = typeof block.data.url === 'string' ? block.data.url : '';
  if (!url) return null;

  return (
    <figure className="my-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- no next/image remote-domain config exists in this app yet */}
      <img
        src={url}
        alt={alt}
        className="w-full rounded-[var(--sportingspy-radius,0.5rem)]"
        loading="lazy"
      />
      {caption ? <figcaption className="mt-2 text-sm text-gray-500">{caption}</figcaption> : null}
    </figure>
  );
}
