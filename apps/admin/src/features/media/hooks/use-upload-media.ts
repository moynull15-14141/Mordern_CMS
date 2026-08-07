'use client';

import { useCallback } from 'react';
import { mediaApi } from '../services/media.api';
import { mediaUploadApi } from '../services/media-upload.service';
import type { CreateUploadRequestInput, Media } from '../types/media';
import type { UploadQueueItemStatus } from '../components/upload-queue.types';

const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 40; // ~60s

export interface UploadMediaOptions {
  input: CreateUploadRequestInput;
  file: File;
  metadataPatch?: { altText?: string; caption?: string; credit?: string };
  signal: AbortSignal;
  onStatusChange: (status: UploadQueueItemStatus) => void;
  onProgress: (percent: number) => void;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Orchestrates the real upload pipeline (Milestone 5): request a presigned
 * URL → PUT the file bytes directly to R2 → (optionally) patch alt/caption/
 * credit metadata → confirm the upload (enqueues async processing) → poll
 * `GET /media/:id` until the async processor finishes (`READY`/`FAILED`)
 * or the poll budget is exhausted. No WebSockets/SSE exist anywhere in
 * this codebase — polling is the honest, matching mechanism.
 */
export function useUploadMedia() {
  const uploadFile = useCallback(async (options: UploadMediaOptions): Promise<Media> => {
    const { input, file, metadataPatch, signal, onStatusChange, onProgress } = options;

    onStatusChange('requesting');
    const request = await mediaUploadApi.requestUpload(input, signal);

    onStatusChange('uploading');
    await mediaUploadApi.uploadToPresignedUrl(request.uploadUrl, file, { onProgress, signal });

    if (metadataPatch && (metadataPatch.altText || metadataPatch.caption || metadataPatch.credit)) {
      await mediaApi.update(request.mediaAssetId, metadataPatch);
    }

    onStatusChange('confirming');
    let result = await mediaUploadApi.confirmUpload(request.mediaAssetId, signal);

    onStatusChange('processing');
    for (
      let attempt = 0;
      attempt < POLL_MAX_ATTEMPTS && result.status === 'PROCESSING';
      attempt += 1
    ) {
      if (signal.aborted) throw new DOMException('Upload aborted.', 'AbortError');
      await wait(POLL_INTERVAL_MS);
      result = await mediaApi.get(request.mediaAssetId);
    }

    onStatusChange(result.status === 'FAILED' ? 'error' : 'success');
    return result;
  }, []);

  return { uploadFile };
}
