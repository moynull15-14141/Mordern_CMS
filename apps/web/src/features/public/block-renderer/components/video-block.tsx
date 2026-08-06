import type { BlockComponentProps } from '../types/block.types';

export function VideoBlock({ block }: BlockComponentProps) {
  const url = typeof block.data.url === 'string' ? block.data.url : '';
  const poster = typeof block.data.poster === 'string' ? block.data.poster : undefined;
  const caption = typeof block.data.caption === 'string' ? block.data.caption : '';
  if (!url) return null;

  return (
    <figure className="my-2">
      <video
        src={url}
        poster={poster}
        controls
        className="w-full rounded-[var(--sportingspy-radius,0.5rem)]"
      />
      {caption ? <figcaption className="mt-2 text-sm text-gray-500">{caption}</figcaption> : null}
    </figure>
  );
}
