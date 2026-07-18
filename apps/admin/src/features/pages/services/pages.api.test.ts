import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { pagesApi } from './pages.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('pagesApi', () => {
  it('list() calls api.getPaginated with /pages and the filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await pagesApi.list({ page: 1, limit: 20 });
    expect(api.getPaginated).toHaveBeenCalledWith('/pages', { params: { page: 1, limit: 20 } });
  });

  it('get() calls api.get with /pages/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await pagesApi.get('p1');
    expect(api.get).toHaveBeenCalledWith('/pages/p1');
  });

  it('getBySlug() calls api.get with /pages/slug/:slug', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await pagesApi.getBySlug('about-us');
    expect(api.get).toHaveBeenCalledWith('/pages/slug/about-us');
  });

  it('create() calls api.post with /pages and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { title: 'About Us', body: {} };
    await pagesApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/pages', input);
  });

  it('update() calls api.patch with /pages/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { title: 'New Title' };
    await pagesApi.update('p1', input);
    expect(api.patch).toHaveBeenCalledWith('/pages/p1', input);
  });

  it('remove() calls api.delete with /pages/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await pagesApi.remove('p1');
    expect(api.delete).toHaveBeenCalledWith('/pages/p1');
  });

  it('restore() calls api.post with /pages/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await pagesApi.restore('p1');
    expect(api.post).toHaveBeenCalledWith('/pages/p1/restore');
  });

  it('publish() calls api.post with /pages/:id/publish', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await pagesApi.publish('p1');
    expect(api.post).toHaveBeenCalledWith('/pages/p1/publish');
  });

  it('does not expose a schedule function (no /pages/:id/schedule endpoint exists)', () => {
    expect(pagesApi).not.toHaveProperty('schedule');
  });
});
