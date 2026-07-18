import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api-client';
import { profileApi } from './profile.api';

vi.mock('@/lib/api-client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('profileApi', () => {
  it('getMe() calls api.get with /users/me', async () => {
    vi.mocked(api.get).mockResolvedValue({});
    await profileApi.getMe();
    expect(api.get).toHaveBeenCalledWith('/users/me');
  });

  it('updateProfile() calls api.patch with /users/me/profile and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { firstName: 'Jane' };
    await profileApi.updateProfile(input);
    expect(api.patch).toHaveBeenCalledWith('/users/me/profile', input);
  });

  it('updatePreferences() calls api.patch with /users/me/preferences and the input', async () => {
    vi.mocked(api.patch).mockResolvedValue({});
    const input = { theme: 'DARK' as const };
    await profileApi.updatePreferences(input);
    expect(api.patch).toHaveBeenCalledWith('/users/me/preferences', input);
  });

  it('removeAvatar() calls api.delete with /users/me/avatar', async () => {
    vi.mocked(api.delete).mockResolvedValue({});
    await profileApi.removeAvatar();
    expect(api.delete).toHaveBeenCalledWith('/users/me/avatar');
  });

  it('changePassword() calls api.post with /users/:id/change-password and the input', async () => {
    vi.mocked(api.post).mockResolvedValue({ message: 'ok' });
    const input = { currentPassword: 'old', newPassword: 'New1!aaaa' };
    await profileApi.changePassword('u1', input);
    expect(api.post).toHaveBeenCalledWith('/users/u1/change-password', input);
  });

  it('does not expose a setAvatar/uploadAvatar function (no MediaAsset picker exists)', () => {
    expect(profileApi).not.toHaveProperty('setAvatar');
    expect(profileApi).not.toHaveProperty('uploadAvatar');
    expect(profileApi).not.toHaveProperty('updateAvatar');
  });
});
