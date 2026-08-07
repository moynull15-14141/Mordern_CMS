import type { BlockComponentProps } from '../types/block.types';
import { getMedia } from '../../services/media.service';

interface GalleryImage {
  mediaId?: unknown;
  url?: unknown;
  alt?: unknown;
  caption?: unknown;
}

interface ResolvedGalleryImage {
  key: string;
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Async Server Component (Milestone 5) — resolves each item's `mediaId`
 * in parallel via `getMedia` (request-level `cache()`-deduped), falling
 * back to the legacy `url` string per-item for pre-existing content.
 */
export async function GalleryBlock({ block }: BlockComponentProps) {
  const images = Array.isArray(block.data.images) ? (block.data.images as GalleryImage[]) : [];

  const resolved = await Promise.all(
    images.map(async (image, index): Promise<ResolvedGalleryImage | null> => {
      const alt = typeof image.alt === 'string' ? image.alt : '';
      const caption = typeof image.caption === 'string' ? image.caption : undefined;

      if (typeof image.mediaId === 'string' && image.mediaId) {
        const media = await getMedia(image.mediaId);
        const src = media?.urls.original ?? media?.urls.large ?? media?.urls.medium;
        if (!src) return null;
        return { key: `${image.mediaId}-${index}`, src, alt: alt || media?.altText || '', caption };
      }

      if (typeof image.url === 'string' && image.url && alt) {
        return { key: `${image.url}-${index}`, src: image.url, alt, caption };
      }

      return null;
    })
  );

  const valid = resolved.filter((image): image is ResolvedGalleryImage => image !== null);
  if (valid.length === 0) return null;

  return (
    <div className="my-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {valid.map((image) => (
        <figure key={image.key}>
          {/* eslint-disable-next-line @next/next/no-img-element -- no next/image remote-domain config exists in this app yet */}
          <img
            src={image.src}
            alt={image.alt}
            className="aspect-square w-full rounded-[var(--sportingspy-radius,0.5rem)] object-cover"
            loading="lazy"
          />
          {image.caption ? (
            <figcaption className="mt-1 text-xs text-gray-500">{image.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
