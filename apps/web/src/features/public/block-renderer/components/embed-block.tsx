import type { BlockComponentProps } from '../types/block.types';

export function EmbedBlock({ block }: BlockComponentProps) {
  const url = typeof block.data.url === 'string' ? block.data.url : '';
  const caption = typeof block.data.caption === 'string' ? block.data.caption : '';
  if (!url) return null;

  return (
    <figure className="my-2">
      <div className="aspect-video w-full overflow-hidden rounded-[var(--sportingspy-radius,0.5rem)]">
        <iframe
          src={url}
          title={caption || 'Embedded content'}
          className="h-full w-full"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      </div>
      {caption ? <figcaption className="mt-2 text-sm text-gray-500">{caption}</figcaption> : null}
    </figure>
  );
}
