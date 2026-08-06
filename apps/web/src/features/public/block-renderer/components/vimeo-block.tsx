import type { BlockComponentProps } from '../types/block.types';

export function VimeoBlock({ block }: BlockComponentProps) {
  const videoId = typeof block.data.videoId === 'string' ? block.data.videoId : '';
  const caption = typeof block.data.caption === 'string' ? block.data.caption : '';
  if (!videoId) return null;

  return (
    <figure className="my-2">
      <div className="aspect-video w-full overflow-hidden rounded-[var(--sportingspy-radius,0.5rem)]">
        <iframe
          src={`https://player.vimeo.com/video/${encodeURIComponent(videoId)}`}
          title={caption || 'Vimeo video'}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />
      </div>
      {caption ? <figcaption className="mt-2 text-sm text-gray-500">{caption}</figcaption> : null}
    </figure>
  );
}
