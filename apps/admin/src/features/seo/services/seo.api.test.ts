import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { seoApi } from './seo.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('seoApi', () => {
  it('get() calls api.get with /seo/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await seoApi.get('s1');
    expect(api.get).toHaveBeenCalledWith('/seo/s1');
  });

  it('getForArticle() calls api.get with /seo/article/:articleId', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await seoApi.getForArticle('a1');
    expect(api.get).toHaveBeenCalledWith('/seo/article/a1');
  });

  it('getForCategory() calls api.get with /seo/category/:categoryId', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await seoApi.getForCategory('c1');
    expect(api.get).toHaveBeenCalledWith('/seo/category/c1');
  });

  it('create() calls api.post with /seo and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { siteId: 'site1', title: 'Hello' };
    await seoApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/seo', input);
  });

  it('update() calls api.patch with /seo/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { title: 'New title' };
    await seoApi.update('s1', input);
    expect(api.patch).toHaveBeenCalledWith('/seo/s1', input);
  });

  it('upsert() calls api.post with /seo/upsert and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { siteId: 'site1', title: 'Hello' };
    await seoApi.upsert(input);
    expect(api.post).toHaveBeenCalledWith('/seo/upsert', input);
  });

  it('remove() calls api.delete with /seo/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await seoApi.remove('s1');
    expect(api.delete).toHaveBeenCalledWith('/seo/s1');
  });

  it('restore() calls api.post with /seo/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await seoApi.restore('s1');
    expect(api.post).toHaveBeenCalledWith('/seo/s1/restore');
  });

  it('preview() calls api.post with /seo/preview and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { title: 'Hello' };
    await seoApi.preview(input);
    expect(api.post).toHaveBeenCalledWith('/seo/preview', input);
  });

  it('validate() calls api.post with /seo/validate and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { title: 'Hello' };
    await seoApi.validate(input);
    expect(api.post).toHaveBeenCalledWith('/seo/validate', input);
  });

  it('does not expose a list function (no such endpoint exists on the backend)', () => {
    expect(seoApi).not.toHaveProperty('list');
  });
});
