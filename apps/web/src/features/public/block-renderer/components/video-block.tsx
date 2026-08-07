import type { BlockComponentProps } from '../types/block.types';
import { getMedia } from '../../services/media.service';

/**
 * Async Server Component (Milestone 5) — resolves `data.mediaId`/
 * `data.posterMediaId` via `getMedia`, falling back to the legacy
 * `data.url`/`data.poster` strings for pre-existing content.
 */
export async function VideoBlock({ block }: BlockComponentProps) {
  const mediaId = typeof block.data.mediaId === 'string' ? block.data.mediaId : '';
  const posterMediaId =
    typeof block.data.posterMediaId === 'string' ? block.data.posterMediaId : '';
  const caption = typeof block.data.caption === 'string' ? block.data.caption : '';

  let src: string | undefined;
  let poster: string | undefined;

  if (mediaId) {
    const [media, posterMedia] = await Promise.all([
      getMedia(mediaId),
      posterMediaId ? getMedia(posterMediaId) : Promise.resolve(null),
    ]);
    if (!media) return null;
    src = media.urls.original ?? media.urls.large;
    poster = posterMedia?.urls.original ?? posterMedia?.urls.large;
  } else {
    src = typeof block.data.url === 'string' ? block.data.url : undefined;
    poster = typeof block.data.poster === 'string' ? block.data.poster : undefined;
  }

  if (!src) return null;

  return (
    <figure className="my-2">
      <video
        src={src}
        poster={poster}
        controls
        className="w-full rounded-[var(--sportingspy-radius,0.5rem)]"
      />
      {caption ? <figcaption className="mt-2 text-sm text-gray-500">{caption}</figcaption> : null}
    </figure>
  );
}
