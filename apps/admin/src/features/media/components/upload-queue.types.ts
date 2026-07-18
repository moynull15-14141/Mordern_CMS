import type { ExtractedFileMetadata } from '../utils/extract-file-metadata';
import type { Media } from '../types/media';

export type UploadQueueItemStatus = 'pending' | 'submitting' | 'success' | 'error' | 'canceled';

/**
 * One locally-queued file awaiting registration. `abortController` backs
 * real cancel of the in-flight `POST /media` request (Axios `signal`
 * support) — there is no "upload progress" percentage anywhere in this
 * type, because no file bytes are ever transferred to any endpoint (see
 * docs/67_FRONTEND_MEDIA.md); status transitions (pending → submitting →
 * success/error) are the real, honest signal instead.
 */
export interface UploadQueueItem {
  localId: string;
  file: File;
  previewUrl: string | null;
  metadata: ExtractedFileMetadata;
  storageKey: string;
  folderId: string;
  altText: string;
  caption: string;
  credit: string;
  status: UploadQueueItemStatus;
  errorMessage: string | null;
  result: Media | null;
  abortController: AbortController | null;
}
