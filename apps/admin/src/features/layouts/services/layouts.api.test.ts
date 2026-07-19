import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { layoutsApi } from './layouts.api';

vi.mock('@/lib/api-client', () => ({
  api: { get: vi.fn(), getPaginated: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('layoutsApi', () => {
  it('list() calls api.getPaginated with /layouts and the filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await layoutsApi.list({ page: 1, limit: 20 });
    expect(api.getPaginated).toHaveBeenCalledWith('/layouts', { params: { page: 1, limit: 20 } });
  });

  it('get() calls api.get with /layouts/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await layoutsApi.get('l1');
    expect(api.get).toHaveBeenCalledWith('/layouts/l1');
  });

  it('create() calls api.post with /layouts and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { name: 'Default', layoutPreset: 'default' };
    await layoutsApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/layouts', input);
  });

  it('update() calls api.patch with /layouts/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { name: 'New Name' };
    await layoutsApi.update('l1', input);
    expect(api.patch).toHaveBeenCalledWith('/layouts/l1', input);
  });

  it('remove() calls api.delete with /layouts/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await layoutsApi.remove('l1');
    expect(api.delete).toHaveBeenCalledWith('/layouts/l1');
  });

  it('restore() calls api.post with /layouts/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await layoutsApi.restore('l1');
    expect(api.post).toHaveBeenCalledWith('/layouts/l1/restore');
  });

  it('does not expose an activate endpoint (no singleton "active" concept for Layout)', () => {
    expect(layoutsApi).not.toHaveProperty('activate');
  });
});
