import type { BlockComponentProps } from '../types/block.types';

export function ImageBlock({ block }: BlockComponentProps) {
  const url = typeof block.data.url === 'string' ? block.data.url : '';
  const alt = typeof block.data.alt === 'string' ? block.data.alt : '';
  const caption = typeof block.data.caption === 'string' ? block.data.caption : '';
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
