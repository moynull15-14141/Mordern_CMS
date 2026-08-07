import type { BlockComponentProps } from '../types/block.types';
import { isSafeHref } from '../utils/safe-url.util';
import { getMedia } from '../../services/media.service';

/**
 * Async Server Component (Milestone 5) — resolves `data.mediaId` via
 * `getMedia`, falling back to the legacy `data.url` string for
 * pre-existing content.
 */
export async function FileDownloadBlock({ block }: BlockComponentProps) {
  const mediaId = typeof block.data.mediaId === 'string' ? block.data.mediaId : '';
  const filesize = typeof block.data.filesize === 'string' ? block.data.filesize : '';
  let url = typeof block.data.url === 'string' ? block.data.url : '';

  if (mediaId) {
    const media = await getMedia(mediaId);
    if (!media) return null;
    url = media.urls.original ?? '';
  }

  const filename =
    typeof block.data.filename === 'string'
      ? block.data.filename
      : url.split('/').pop() || 'Download';
  if (!url || !isSafeHref(url)) return null;

  return (
    <a
      href={url}
      download
      className="my-2 flex items-center gap-3 rounded-[var(--sportingspy-radius,0.5rem)] border border-gray-200 p-4 transition hover:border-[var(--sportingspy-color-primary)]"
    >
      <span className="text-sm font-medium text-gray-900">{filename}</span>
      {filesize ? <span className="text-xs text-gray-500">{filesize}</span> : null}
    </a>
  );
}
