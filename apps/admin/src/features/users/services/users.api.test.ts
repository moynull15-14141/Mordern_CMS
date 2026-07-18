import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { usersApi } from './users.api';

vi.mock('@/lib/api-client', () => ({
  api: {
    get: vi.fn(),
    getPaginated: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('usersApi', () => {
  it('list() calls api.getPaginated with /users and the filters as params', async () => {
    vi.mocked(api.getPaginated).mockResolvedValue({ data: [], meta: {} });
    await usersApi.list({ page: 1, limit: 20, status: 'ACTIVE' });
    expect(api.getPaginated).toHaveBeenCalledWith('/users', {
      params: { page: 1, limit: 20, status: 'ACTIVE' },
    });
  });

  it('get() calls api.get with /users/:id', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await usersApi.get('u1');
    expect(api.get).toHaveBeenCalledWith('/users/u1');
  });

  it('create() calls api.post with /users and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    const input = { email: 'a@b.com' };
    await usersApi.create(input);
    expect(api.post).toHaveBeenCalledWith('/users', input);
  });

  it('update() calls api.patch with /users/:id and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { displayName: 'New Name' };
    await usersApi.update('u1', input);
    expect(api.patch).toHaveBeenCalledWith('/users/u1', input);
  });

  it('remove() calls api.delete with /users/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await usersApi.remove('u1');
    expect(api.delete).toHaveBeenCalledWith('/users/u1');
  });

  it('restore() calls api.post with /users/:id/restore', async () => {
    vi.mocked(api.post).mockResolvedValue({});
    await usersApi.restore('u1');
    expect(api.post).toHaveBeenCalledWith('/users/u1/restore');
  });

  it('resetPassword() calls api.post with /users/:id/reset-password and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({ message: 'ok' });
    const input = { newPassword: 'New1!aaaa' };
    await usersApi.resetPassword('u1', input);
    expect(api.post).toHaveBeenCalledWith('/users/u1/reset-password', input);
  });

  it('does not expose changePassword/profile/preferences/avatar functions — those live in profile.api.ts', () => {
    expect(usersApi).not.toHaveProperty('changePassword');
    expect(usersApi).not.toHaveProperty('getMe');
    expect(usersApi).not.toHaveProperty('updateMyProfile');
    expect(usersApi).not.toHaveProperty('updateMyPreferences');
    expect(usersApi).not.toHaveProperty('removeMyAvatar');
  });
});
