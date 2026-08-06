import type { BlockComponentProps } from '../types/block.types';

interface GalleryImage {
  url?: unknown;
  alt?: unknown;
  caption?: unknown;
}

export function GalleryBlock({ block }: BlockComponentProps) {
  const images = Array.isArray(block.data.images) ? (block.data.images as GalleryImage[]) : [];
  const valid = images.filter(
    (image): image is { url: string; alt: string; caption?: string } =>
      typeof image.url === 'string' && typeof image.alt === 'string'
  );
  if (valid.length === 0) return null;

  return (
    <div className="my-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {valid.map((image, index) => (
        <figure key={`${image.url}-${index}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- no next/image remote-domain config exists in this app yet */}
          <img
            src={image.url}
            alt={image.alt}
            className="aspect-square w-full rounded-[var(--sportingspy-radius,0.5rem)] object-cover"
            loading="lazy"
          />
          {typeof image.caption === 'string' && image.caption ? (
            <figcaption className="mt-1 text-xs text-gray-500">{image.caption}</figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
