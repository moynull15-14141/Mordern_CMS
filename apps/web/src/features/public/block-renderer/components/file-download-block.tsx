import type { BlockComponentProps } from '../types/block.types';
import { isSafeHref } from '../utils/safe-url.util';

export function FileDownloadBlock({ block }: BlockComponentProps) {
  const url = typeof block.data.url === 'string' ? block.data.url : '';
  const filename =
    typeof block.data.filename === 'string'
      ? block.data.filename
      : url.split('/').pop() || 'Download';
  const filesize = typeof block.data.filesize === 'string' ? block.data.filesize : '';
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
