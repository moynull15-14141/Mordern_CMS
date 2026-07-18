import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { articlesApi } from './articles.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('articlesApi', () => {
  it('list() calls api.getPaginated with /articles and the filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await articlesApi.list({ page: 1, limit: 20 });
    expect(api.getPaginated).toHaveBeenCalledWith('/articles', { params: { page: 1, limit: 20 } });
  });

  it('get() calls api.get with /articles/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await articlesApi.get('a1');
    expect(api.get).toHaveBeenCalledWith('/articles/a1');
  });

  it('getBySlug() calls api.get with /articles/slug/:slug', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await articlesApi.getBySlug('my-post');
    expect(api.get).toHaveBeenCalledWith('/articles/slug/my-post');
  });

  it('create() calls api.post with /articles and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { title: 'Hello', body: { text: 'x' }, authorId: 'au1', language: 'en', locale: 'en-US' };
    await articlesApi.create(input as never);
    expect(api.post).toHaveBeenCalledWith('/articles', input);
  });

  it('update() calls api.patch with /articles/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { title: 'New title' };
    await articlesApi.update('a1', input);
    expect(api.patch).toHaveBeenCalledWith('/articles/a1', input);
  });

  it('remove() calls api.delete with /articles/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await articlesApi.remove('a1');
    expect(api.delete).toHaveBeenCalledWith('/articles/a1');
  });

  it('restore() calls api.post with /articles/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await articlesApi.restore('a1');
    expect(api.post).toHaveBeenCalledWith('/articles/a1/restore');
  });

  it('publish() calls api.post with /articles/:id/publish', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await articlesApi.publish('a1');
    expect(api.post).toHaveBeenCalledWith('/articles/a1/publish');
  });

  it('schedule() calls api.post with /articles/:id/schedule and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { scheduledAt: '2026-08-01T00:00:00.000Z' };
    await articlesApi.schedule('a1', input);
    expect(api.post).toHaveBeenCalledWith('/articles/a1/schedule', input);
  });

  it('listRevisions() calls api.get with /articles/:id/revisions', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await articlesApi.listRevisions('a1');
    expect(api.get).toHaveBeenCalledWith('/articles/a1/revisions');
  });

  it('compareRevisions() calls api.get with /articles/:id/revisions/compare and from/to params', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await articlesApi.compareRevisions('a1', 1, 2);
    expect(api.get).toHaveBeenCalledWith('/articles/a1/revisions/compare', { params: { from: 1, to: 2 } });
  });

  it('restoreRevision() calls api.post with /articles/:id/revisions/:version/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await articlesApi.restoreRevision('a1', 3);
    expect(api.post).toHaveBeenCalledWith('/articles/a1/revisions/3/restore');
  });

  it('does not expose a bulk delete/update function (no such capability exists on the backend)', () => {
    expect(articlesApi).not.toHaveProperty('bulkRemove');
    expect(articlesApi).not.toHaveProperty('bulkUpdate');
  });
});
