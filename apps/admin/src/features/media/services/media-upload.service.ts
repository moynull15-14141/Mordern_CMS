import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { CreateUploadRequestInput, Media, UploadRequestResult } from '../types/media';

export interface UploadProgressOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

/**
 * The real upload transport (Milestone 5) — `requestUpload`/`confirmUpload`
 * go through the shared `apiClient` (envelope-wrapped, auth token
 * injected) like every other service in this feature.
 * `uploadToPresignedUrl` deliberately does NOT — it PUTs bytes straight to
 * R2 via the presigned URL returned by `requestUpload`, a different origin
 * entirely with no auth header and no envelope, and it uses a raw
 * `XMLHttpRequest` rather than `fetch`/Axios because only `XMLHttpRequest`
 * exposes `upload.onprogress` for real byte-level progress — the reason
 * this feature never had a real progress bar before this milestone.
 */
export const mediaUploadApi = {
  requestUpload(
    input: CreateUploadRequestInput,
    signal?: AbortSignal
  ): Promise<UploadRequestResult> {
    return api.post<UploadRequestResult>(API_ENDPOINTS.MEDIA.uploadRequests, input, { signal });
  },

  uploadToPresignedUrl(
    url: string,
    file: File,
    options: UploadProgressOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && options.onProgress) {
          options.onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}.`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload.'));
      xhr.onabort = () => reject(new DOMException('Upload aborted.', 'AbortError'));

      if (options.signal) {
        if (options.signal.aborted) {
          xhr.abort();
          return;
        }
        options.signal.addEventListener('abort', () => xhr.abort());
      }

      xhr.send(file);
    });
  },

  confirmUpload(mediaAssetId: string, signal?: AbortSignal): Promise<Media> {
    return api.post<Media>(API_ENDPOINTS.MEDIA.confirmUpload(mediaAssetId), undefined, { signal });
  },
};
