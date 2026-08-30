import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { redirectsApi } from './redirects.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('redirectsApi', () => {
  it('list() calls api.getPaginated with /redirects and the filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await redirectsApi.list({ page: 1, limit: 20 });
    expect(api.getPaginated).toHaveBeenCalledWith('/redirects', { params: { page: 1, limit: 20 } });
  });

  it('get() calls api.get with /redirects/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await redirectsApi.get('r1');
    expect(api.get).toHaveBeenCalledWith('/redirects/r1');
  });

  it('create() calls api.post with /redirects and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { sourcePath: '/old', destinationUrl: '/new', redirectType: 301 };
    await redirectsApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/redirects', input);
  });

  it('update() calls api.patch with /redirects/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    await redirectsApi.update('r1', { status: 'INACTIVE' });
    expect(api.patch).toHaveBeenCalledWith('/redirects/r1', { status: 'INACTIVE' });
  });

  it('remove() calls api.delete with /redirects/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await redirectsApi.remove('r1');
    expect(api.delete).toHaveBeenCalledWith('/redirects/r1');
  });

  it('restore() calls api.post with /redirects/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await redirectsApi.restore('r1');
    expect(api.post).toHaveBeenCalledWith('/redirects/r1/restore');
  });
});
