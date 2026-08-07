import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUploadMedia } from './use-upload-media';
import { mediaApi } from '../services/media.api';
import { mediaUploadApi } from '../services/media-upload.service';

vi.mock('../services/media.api', () => ({ mediaApi: { get: vi.fn(), update: vi.fn() } }));
vi.mock('../services/media-upload.service', () => ({
  mediaUploadApi: { requestUpload: vi.fn(), uploadToPresignedUrl: vi.fn(), confirmUpload: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

const baseInput = {
  type: 'IMAGE' as const,
  filename: 'photo.png',
  mimeType: 'image/png',
  filesize: '1024',
};
const request = {
  mediaAssetId: 'm1',
  uploadUrl: 'https://r2.example.com/put',
  expiresAt: '2026-01-01T00:15:00.000Z',
  storageKey: 'uploads/site-1/m1/photo.png',
};

describe('useUploadMedia', () => {
  it('runs request → PUT → confirm → poll and reports every status transition in order', async () => {
    (mediaUploadApi.requestUpload as ReturnType<typeof vi.fn>).mockResolvedValue(request);
    (mediaUploadApi.uploadToPresignedUrl as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (mediaUploadApi.confirmUpload as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'm1',
      status: 'READY',
    });

    const { result } = renderHook(() => useUploadMedia());
    const statuses: string[] = [];
    const controller = new AbortController();

    const media = await result.current.uploadFile({
      input: baseInput,
      file: new File(['x'], 'photo.png', { type: 'image/png' }),
      signal: controller.signal,
      onStatusChange: (status) => statuses.push(status),
      onProgress: vi.fn(),
    });

    expect(statuses).toEqual(['requesting', 'uploading', 'confirming', 'processing', 'success']);
    expect(media.status).toBe('READY');
    expect(mediaApi.get).not.toHaveBeenCalled(); // already READY on confirm — no poll needed
  });

  it('polls GET /media/:id until the async processor finishes', async () => {
    (mediaUploadApi.requestUpload as ReturnType<typeof vi.fn>).mockResolvedValue(request);
    (mediaUploadApi.uploadToPresignedUrl as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (mediaUploadApi.confirmUpload as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'm1',
      status: 'PROCESSING',
    });
    (mediaApi.get as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ id: 'm1', status: 'PROCESSING' })
      .mockResolvedValueOnce({ id: 'm1', status: 'READY' });

    const { result } = renderHook(() => useUploadMedia());
    const media = await result.current.uploadFile({
      input: baseInput,
      file: new File(['x'], 'photo.png', { type: 'image/png' }),
      signal: new AbortController().signal,
      onStatusChange: vi.fn(),
      onProgress: vi.fn(),
    });

    expect(mediaApi.get).toHaveBeenCalledTimes(2);
    expect(media.status).toBe('READY');
  }, 15000);

  it('patches altText/caption/credit after a successful upload when provided', async () => {
    (mediaUploadApi.requestUpload as ReturnType<typeof vi.fn>).mockResolvedValue(request);
    (mediaUploadApi.uploadToPresignedUrl as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (mediaUploadApi.confirmUpload as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'm1',
      status: 'READY',
    });

    const { result } = renderHook(() => useUploadMedia());
    await result.current.uploadFile({
      input: baseInput,
      file: new File(['x'], 'photo.png', { type: 'image/png' }),
      metadataPatch: { altText: 'A cat' },
      signal: new AbortController().signal,
      onStatusChange: vi.fn(),
      onProgress: vi.fn(),
    });

    expect(mediaApi.update).toHaveBeenCalledWith('m1', { altText: 'A cat' });
  });

  it('reports a FAILED processing result as the "error" status', async () => {
    (mediaUploadApi.requestUpload as ReturnType<typeof vi.fn>).mockResolvedValue(request);
    (mediaUploadApi.uploadToPresignedUrl as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (mediaUploadApi.confirmUpload as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'm1',
      status: 'FAILED',
    });

    const { result } = renderHook(() => useUploadMedia());
    const statuses: string[] = [];
    await result.current.uploadFile({
      input: baseInput,
      file: new File(['x'], 'photo.png', { type: 'image/png' }),
      signal: new AbortController().signal,
      onStatusChange: (status) => statuses.push(status),
      onProgress: vi.fn(),
    });

    expect(statuses.at(-1)).toBe('error');
  });
});
