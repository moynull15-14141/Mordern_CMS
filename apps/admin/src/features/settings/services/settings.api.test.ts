import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { settingsApi } from './settings.api';

vi.mock('@/lib/api-client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('settingsApi', () => {
  it('getAll() calls api.get with /settings', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await settingsApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/settings');
  });

  it('getByCategory() calls api.get with /settings/category/:category', async () => {
    vi.mocked(api.get).mockResolvedValue([]);
    await settingsApi.getByCategory('seo');
    expect(api.get).toHaveBeenCalledWith('/settings/category/seo');
  });

  it('getByKey() calls api.get with /settings/:key', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await settingsApi.getByKey('general.siteName');
    expect(api.get).toHaveBeenCalledWith('/settings/general.siteName');
  });

  it('updateSetting() calls api.put with /settings/:key and the input', async () => {
    vi.mocked(api.put).mockResolvedValue({});
    const input = { value: 'New Site Name' };
    await settingsApi.updateSetting('general.siteName', input);
    expect(api.put).toHaveBeenCalledWith('/settings/general.siteName', input);
  });

  it('bulkUpdateCategory() calls api.put with /settings/category/:category and the input', async () => {
    vi.mocked(api.put).mockResolvedValue([]);
    const input = { settings: [{ key: 'siteName', value: 'New Name' }] };
    await settingsApi.bulkUpdateCategory('general', input);
    expect(api.put).toHaveBeenCalledWith('/settings/category/general', input);
  });

  it('resetCategory() calls api.post with /settings/reset/category and the category body', async () => {
    vi.mocked(api.post).mockResolvedValue({ resetCount: 2 });
    await settingsApi.resetCategory('seo');
    expect(api.post).toHaveBeenCalledWith('/settings/reset/category', { category: 'seo' });
  });

  it('resetAll() calls api.post with /settings/reset', async () => {
    vi.mocked(api.post).mockResolvedValue({ resetCount: 34 });
    await settingsApi.resetAll();
    expect(api.post).toHaveBeenCalledWith('/settings/reset');
  });

  it('does not expose create/delete/import/export functions — out of scope / no such capability', () => {
    expect(settingsApi).not.toHaveProperty('create');
    expect(settingsApi).not.toHaveProperty('remove');
    expect(settingsApi).not.toHaveProperty('delete');
    expect(settingsApi).not.toHaveProperty('import');
    expect(settingsApi).not.toHaveProperty('export');
  });
});
