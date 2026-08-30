import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { menusApi } from './menus.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('menusApi', () => {
  it('list() calls api.getPaginated with /menus and the filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await menusApi.list({ page: 1, limit: 20 });
    expect(api.getPaginated).toHaveBeenCalledWith('/menus', { params: { page: 1, limit: 20 } });
  });

  it('get() calls api.get with /menus/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await menusApi.get('m1');
    expect(api.get).toHaveBeenCalledWith('/menus/m1');
  });

  it('getBySlug() calls api.get with /menus/slug/:slug', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await menusApi.getBySlug('main-navigation');
    expect(api.get).toHaveBeenCalledWith('/menus/slug/main-navigation');
  });

  it('create() calls api.post with /menus and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { name: 'Main Navigation', location: 'header' };
    await menusApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/menus', input);
  });

  it('update() calls api.patch with /menus/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    await menusApi.update('m1', { name: 'New name' });
    expect(api.patch).toHaveBeenCalledWith('/menus/m1', { name: 'New name' });
  });

  it('remove() calls api.delete with /menus/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await menusApi.remove('m1');
    expect(api.delete).toHaveBeenCalledWith('/menus/m1');
  });

  it('restore() calls api.post with /menus/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await menusApi.restore('m1');
    expect(api.post).toHaveBeenCalledWith('/menus/m1/restore');
  });

  it('createItem() calls api.post with /menus/:menuId/items and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { label: 'About', targetType: 'PAGE' as const, pageId: 'p1' };
    await menusApi.createItem('m1', input);
    expect(api.post).toHaveBeenCalledWith('/menus/m1/items', input);
  });

  it('updateItem() calls api.patch with /menus/:menuId/items/:itemId and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    await menusApi.updateItem('m1', 'i1', { label: 'New label' });
    expect(api.patch).toHaveBeenCalledWith('/menus/m1/items/i1', { label: 'New label' });
  });

  it('removeItem() calls api.delete with /menus/:menuId/items/:itemId', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await menusApi.removeItem('m1', 'i1');
    expect(api.delete).toHaveBeenCalledWith('/menus/m1/items/i1');
  });

  it('reorderItems() calls api.post with /menus/:menuId/items/reorder and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { items: [{ id: 'i1', parentId: null, sortOrder: 0 }] };
    await menusApi.reorderItems('m1', input);
    expect(api.post).toHaveBeenCalledWith('/menus/m1/items/reorder', input);
  });
});
