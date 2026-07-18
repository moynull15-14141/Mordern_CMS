import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { categoriesApi } from './categories.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('categoriesApi', () => {
  it('list() calls api.getPaginated with /categories and the filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await categoriesApi.list({ page: 1, limit: 20 });
    expect(api.getPaginated).toHaveBeenCalledWith('/categories', { params: { page: 1, limit: 20 } });
  });

  it('getTree() calls api.get with /categories/tree', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await categoriesApi.getTree();
    expect(api.get).toHaveBeenCalledWith('/categories/tree');
  });

  it('getFlat() calls api.get with /categories/flat', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await categoriesApi.getFlat();
    expect(api.get).toHaveBeenCalledWith('/categories/flat');
  });

  it('getBySlug() calls api.get with /categories/slug/:slug', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await categoriesApi.getBySlug('news');
    expect(api.get).toHaveBeenCalledWith('/categories/slug/news');
  });

  it('get() calls api.get with /categories/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await categoriesApi.get('c1');
    expect(api.get).toHaveBeenCalledWith('/categories/c1');
  });

  it('getChildren() calls api.get with /categories/:id/children', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await categoriesApi.getChildren('c1');
    expect(api.get).toHaveBeenCalledWith('/categories/c1/children');
  });

  it('getDescendants() calls api.get with /categories/:id/descendants', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await categoriesApi.getDescendants('c1');
    expect(api.get).toHaveBeenCalledWith('/categories/c1/descendants');
  });

  it('getAncestors() calls api.get with /categories/:id/ancestors', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await categoriesApi.getAncestors('c1');
    expect(api.get).toHaveBeenCalledWith('/categories/c1/ancestors');
  });

  it('getBreadcrumb() calls api.get with /categories/:id/breadcrumb', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await categoriesApi.getBreadcrumb('c1');
    expect(api.get).toHaveBeenCalledWith('/categories/c1/breadcrumb');
  });

  it('create() calls api.post with /categories and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { name: 'News' };
    await categoriesApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/categories', input);
  });

  it('update() calls api.patch with /categories/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { name: 'New Name' };
    await categoriesApi.update('c1', input);
    expect(api.patch).toHaveBeenCalledWith('/categories/c1', input);
  });

  it('move() calls api.post with /categories/:id/move and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { parentId: 'c2' };
    await categoriesApi.move('c1', input);
    expect(api.post).toHaveBeenCalledWith('/categories/c1/move', input);
  });

  it('remove() calls api.delete with /categories/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await categoriesApi.remove('c1');
    expect(api.delete).toHaveBeenCalledWith('/categories/c1');
  });

  it('restore() calls api.post with /categories/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await categoriesApi.restore('c1');
    expect(api.post).toHaveBeenCalledWith('/categories/c1/restore');
  });

  it('does not expose a bulk delete/update function (no such capability exists on the backend)', () => {
    expect(categoriesApi).not.toHaveProperty('bulkRemove');
  });
});
