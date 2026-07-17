import { UserStatus } from '@prisma/client';
import { UserResponseDto } from './user-response.dto';

describe('UserResponseDto shape', () => {
  it('holds every user field, including the metadata-derived locked/profile/preferences', () => {
    const dto: UserResponseDto = {
      id: 'user-1',
      email: 'a@b.com',
      username: 'user1',
      displayName: 'User One',
      status: UserStatus.ACTIVE,
      profileImageId: null,
      lastLoginAt: null,
      locked: false,
      profile: null,
      preferences: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      deletedAt: null,
    };
    expect(dto.id).toBe('user-1');
    expect(dto.locked).toBe(false);
  });

  it('locked reflects metadata.security.locked, independent of the UserStatus enum', () => {
    const dto: UserResponseDto = {
      id: 'user-2',
      email: 'locked@b.com',
      username: null,
      displayName: null,
      status: UserStatus.ACTIVE,
      profileImageId: null,
      lastLoginAt: null,
      locked: true,
      profile: { firstName: 'A' } as never,
      preferences: { theme: 'DARK' } as never,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      deletedAt: null,
    };
    expect(dto.status).toBe(UserStatus.ACTIVE);
    expect(dto.locked).toBe(true);
  });
});
