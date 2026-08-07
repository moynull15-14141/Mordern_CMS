import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { mediaUploadApi } from './media-upload.service';

vi.mock('@/lib/api-client', () => ({ api: { post: vi.fn() } }));

class FakeXhrUpload {
  onprogress: ((event: ProgressEvent) => void) | null = null;
}

class FakeXhr {
  static instances: FakeXhr[] = [];
  upload = new FakeXhrUpload();
  status = 200;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  sentBody: unknown;
  headers: Record<string, string> = {};
  aborted = false;

  constructor() {
    FakeXhr.instances.push(this);
  }
  open() {}
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }
  send(body: unknown) {
    this.sentBody = body;
  }
  abort() {
    this.aborted = true;
    this.onabort?.();
  }
}

afterEach(() => {
  vi.clearAllMocks();
  FakeXhr.instances.length = 0;
  vi.unstubAllGlobals();
});

describe('mediaUploadApi.requestUpload', () => {
  it('posts to the upload-requests endpoint', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      mediaAssetId: 'm1',
      uploadUrl: 'https://r2.example.com/put',
      expiresAt: '2026-01-01T00:15:00.000Z',
      storageKey: 'uploads/site-1/m1/photo.png',
    });
    const result = await mediaUploadApi.requestUpload({
      type: 'IMAGE',
      filename: 'photo.png',
      mimeType: 'image/png',
      filesize: '1024',
    });
    expect(api.post).toHaveBeenCalledWith(
      '/media/upload-requests',
      expect.objectContaining({ filename: 'photo.png' }),
      { signal: undefined }
    );
    expect(result.mediaAssetId).toBe('m1');
  });
});

describe('mediaUploadApi.uploadToPresignedUrl', () => {
  it('resolves on a successful PUT and reports real progress', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr as unknown as typeof XMLHttpRequest);
    const onProgress = vi.fn();
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    const promise = mediaUploadApi.uploadToPresignedUrl('https://r2.example.com/put', file, {
      onProgress,
    });
    const xhr = FakeXhr.instances[0];
    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 100 } as ProgressEvent);
    xhr.onload?.();

    await expect(promise).resolves.toBeUndefined();
    expect(onProgress).toHaveBeenCalledWith(50);
    expect(xhr.sentBody).toBe(file);
  });

  it('rejects on a non-2xx status', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr as unknown as typeof XMLHttpRequest);
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const promise = mediaUploadApi.uploadToPresignedUrl('https://r2.example.com/put', file);
    const xhr = FakeXhr.instances[0];
    xhr.status = 403;
    xhr.onload?.();
    await expect(promise).rejects.toThrow(/403/);
  });

  it('aborts immediately when the signal is already aborted', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr as unknown as typeof XMLHttpRequest);
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    const controller = new AbortController();
    controller.abort();
    const promise = mediaUploadApi.uploadToPresignedUrl('https://r2.example.com/put', file, {
      signal: controller.signal,
    });
    await expect(promise).rejects.toThrow();
  });
});

describe('mediaUploadApi.confirmUpload', () => {
  it('posts to the confirm-upload endpoint', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'm1', status: 'PROCESSING' });
    const result = await mediaUploadApi.confirmUpload('m1');
    expect(api.post).toHaveBeenCalledWith('/media/m1/confirm-upload', undefined, {
      signal: undefined,
    });
    expect(result.status).toBe('PROCESSING');
  });
});
