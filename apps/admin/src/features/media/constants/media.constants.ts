import type { MediaSortField, MediaStatus, MediaType } from '../types/media';

export const MEDIA_DEFAULT_PAGE_SIZE = 24;

export const TYPE_LABELS: Record<MediaType, string> = {
  IMAGE: 'Image',
  VIDEO: 'Video',
  DOCUMENT: 'Document',
  AUDIO: 'Audio',
};

export const TYPE_OPTIONS: { value: MediaType; label: string }[] = (
  Object.keys(TYPE_LABELS) as MediaType[]
).map((value) => ({ value, label: TYPE_LABELS[value] }));

export const STATUS_LABELS: Record<MediaStatus, string> = {
  PROCESSING: 'Processing',
  READY: 'Ready',
  FAILED: 'Failed',
  ARCHIVED: 'Archived',
};

export const STATUS_OPTIONS: { value: MediaStatus; label: string }[] = (
  Object.keys(STATUS_LABELS) as MediaStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));

export const STATUS_BADGE_VARIANT: Record<MediaStatus, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PROCESSING: 'warning',
  READY: 'success',
  FAILED: 'destructive',
  ARCHIVED: 'secondary',
};

export const SORT_FIELD_LABELS: Record<MediaSortField, string> = {
  filename: 'Filename',
  mimeType: 'MIME type',
  filesize: 'File size',
  createdAt: 'Created',
  updatedAt: 'Updated',
};

/** Mirrors the backend's own `MEDIA_TYPE_MIME_PREFIX`
 * (`apps/backend/src/modules/media/constants/media.constants.ts`) exactly
 * — used to auto-derive `type` from a picked file's browser-reported MIME
 * type, and to mirror `MediaValidator.assertMimeTypeMatchesType()`
 * client-side. DOCUMENT has no fixed prefix on the backend either. */
export const MEDIA_TYPE_MIME_PREFIX: Partial<Record<MediaType, string>> = {
  IMAGE: 'image/',
  VIDEO: 'video/',
  AUDIO: 'audio/',
};

export function inferMediaTypeFromMimeType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  return 'DOCUMENT';
}
