import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMenuByLocation } from './navigation.service';

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: 'status',
      json: async () => body,
    })
  );
}

describe('getMenuByLocation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the menu when the real endpoint responds successfully', async () => {
    mockFetchOnce(200, {
      success: true,
      message: 'ok',
      data: { id: 'm1', name: 'Header', slug: 'header-menu', location: 'header', items: [] },
      meta: {},
      errors: [],
    });

    const menu = await getMenuByLocation('sidebar-unique-1');
    expect(menu).toMatchObject({ id: 'm1', location: 'header' });
  });

  it('returns null when no published menu exists at that location (404)', async () => {
    mockFetchOnce(404, {
      success: false,
      message: 'Menu "footer-unique-2" was not found.',
      data: null,
      meta: {},
      errors: [{ code: 'NOT_FOUND', message: 'Menu "footer-unique-2" was not found.' }],
    });

    const menu = await getMenuByLocation('footer-unique-2');
    expect(menu).toBeNull();
  });
});
