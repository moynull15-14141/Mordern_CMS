import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { tagsApi } from './tags.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('tagsApi', () => {
  it('list() calls api.getPaginated with /tags and the filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await tagsApi.list({ page: 1, limit: 20 });
    expect(api.getPaginated).toHaveBeenCalledWith('/tags', { params: { page: 1, limit: 20 } });
  });

  it('getBySlug() calls api.get with /tags/slug/:slug', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await tagsApi.getBySlug('breaking');
    expect(api.get).toHaveBeenCalledWith('/tags/slug/breaking');
  });

  it('get() calls api.get with /tags/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await tagsApi.get('t1');
    expect(api.get).toHaveBeenCalledWith('/tags/t1');
  });

  it('create() calls api.post with /tags and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { name: 'Breaking' };
    await tagsApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/tags', input);
  });

  it('update() calls api.patch with /tags/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { name: 'New Name' };
    await tagsApi.update('t1', input);
    expect(api.patch).toHaveBeenCalledWith('/tags/t1', input);
  });

  it('remove() calls api.delete with /tags/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await tagsApi.remove('t1');
    expect(api.delete).toHaveBeenCalledWith('/tags/t1');
  });

  it('restore() calls api.post with /tags/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await tagsApi.restore('t1');
    expect(api.post).toHaveBeenCalledWith('/tags/t1/restore');
  });
});
