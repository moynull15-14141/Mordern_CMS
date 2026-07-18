import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { mediaApi } from './media.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('mediaApi', () => {
  it('list() calls api.getPaginated with /media and the filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await mediaApi.list({ page: 1, limit: 24 });
    expect(api.getPaginated).toHaveBeenCalledWith('/media', { params: { page: 1, limit: 24 }, signal: undefined });
  });

  it('list() forwards an AbortSignal when given', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    const controller = new AbortController();
    await mediaApi.list({}, controller.signal);
    expect(api.getPaginated).toHaveBeenCalledWith('/media', { params: {}, signal: controller.signal });
  });

  it('get() calls api.get with /media/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await mediaApi.get('m1');
    expect(api.get).toHaveBeenCalledWith('/media/m1');
  });

  it('getUsages() calls api.get with /media/:id/usages', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await mediaApi.getUsages('m1');
    expect(api.get).toHaveBeenCalledWith('/media/m1/usages');
  });

  it('getDuplicates() calls api.get with /media/:id/duplicates', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await mediaApi.getDuplicates('m1');
    expect(api.get).toHaveBeenCalledWith('/media/m1/duplicates');
  });

  it('create() calls api.post with /media and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { type: 'IMAGE' as const, storageKey: 'a.jpg', mimeType: 'image/jpeg', filesize: '100' };
    await mediaApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/media', input, { signal: undefined });
  });

  it('update() calls api.patch with /media/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { altText: 'A photo' };
    await mediaApi.update('m1', input);
    expect(api.patch).toHaveBeenCalledWith('/media/m1', input);
  });

  it('rename() calls api.post with /media/:id/rename and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { filename: 'new-name.jpg' };
    await mediaApi.rename('m1', input);
    expect(api.post).toHaveBeenCalledWith('/media/m1/rename', input);
  });

  it('move() calls api.post with /media/:id/move and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { folderId: 'f1' };
    await mediaApi.move('m1', input);
    expect(api.post).toHaveBeenCalledWith('/media/m1/move', input);
  });

  it('copyMetadata() calls api.post with /media/:id/copy-metadata and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { targetId: 'm2' };
    await mediaApi.copyMetadata('m1', input);
    expect(api.post).toHaveBeenCalledWith('/media/m1/copy-metadata', input);
  });

  it('remove() calls api.delete with /media/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await mediaApi.remove('m1');
    expect(api.delete).toHaveBeenCalledWith('/media/m1');
  });

  it('restore() calls api.post with /media/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await mediaApi.restore('m1');
    expect(api.post).toHaveBeenCalledWith('/media/m1/restore');
  });

  it('does not expose an upload/download function (no such capability exists on the backend)', () => {
    expect(mediaApi).not.toHaveProperty('upload');
    expect(mediaApi).not.toHaveProperty('download');
  });
});
