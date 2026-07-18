import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { themesApi } from './themes.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('themesApi', () => {
  it('list() calls api.getPaginated with /themes and the filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await themesApi.list({ page: 1, limit: 20 });
    expect(api.getPaginated).toHaveBeenCalledWith('/themes', { params: { page: 1, limit: 20 } });
  });

  it('getActive() calls api.get with /themes/active', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await themesApi.getActive();
    expect(api.get).toHaveBeenCalledWith('/themes/active');
  });

  it('get() calls api.get with /themes/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await themesApi.get('t1');
    expect(api.get).toHaveBeenCalledWith('/themes/t1');
  });

  it('create() calls api.post with /themes and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { name: 'Classic' };
    await themesApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/themes', input);
  });

  it('update() calls api.patch with /themes/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { name: 'New Name' };
    await themesApi.update('t1', input);
    expect(api.patch).toHaveBeenCalledWith('/themes/t1', input);
  });

  it('remove() calls api.delete with /themes/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await themesApi.remove('t1');
    expect(api.delete).toHaveBeenCalledWith('/themes/t1');
  });

  it('restore() calls api.post with /themes/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await themesApi.restore('t1');
    expect(api.post).toHaveBeenCalledWith('/themes/t1/restore');
  });

  it('activate() calls api.post with /themes/:id/activate', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await themesApi.activate('t1');
    expect(api.post).toHaveBeenCalledWith('/themes/t1/activate');
  });

  it('does not expose a bySlug lookup (no such endpoint exists on the backend)', () => {
    expect(themesApi).not.toHaveProperty('getBySlug');
  });
});
