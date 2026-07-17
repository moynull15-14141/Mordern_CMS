import { UserStatus } from '@prisma/client';
import { UsersRepository } from '../repositories/users.repository';
import { UserSessionsRepository } from '../repositories/user-sessions.repository';
import { UsersValidator } from '../validators/users.validator';
import { UsersMapper } from '../mappers/users.mapper';
import { PasswordService } from '../../identity/services/password.service';
import { SessionService } from '../../identity/services/session.service';
import { SessionRepository } from '../../identity/repositories/session.repository';
import { RefreshTokenRepository } from '../../identity/repositories/refresh-token.repository';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { SecurityLoggerService } from '../../../core/logger/security-logger.service';
import {
  InvalidCurrentPasswordException,
  SessionNotFoundException,
  UserAlreadyDeletedException,
  UserConflictException,
  UserNotDeletedException,
  UserNotFoundException,
} from '../exceptions/user.exceptions';
import { UsersService } from './users.service';

function buildUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'a@b.com',
    username: 'auser',
    displayName: 'A User',
    passwordHash: 'hashed',
    status: UserStatus.ACTIVE,
    profileImageId: null,
    lastLoginAt: null,
    metadata: {},
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

function buildService() {
  const usersRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn().mockResolvedValue(null),
    findByUsername: jest.fn().mockResolvedValue(null),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updatePasswordHash: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    findMediaAssetById: jest.fn(),
  } as unknown as UsersRepository;

  const userSessionsRepository = {
    findAllForUser: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
  } as unknown as UserSessionsRepository;

  const passwordService = {
    hash: jest.fn().mockResolvedValue('new-hash'),
    compare: jest.fn().mockResolvedValue(true),
  } as unknown as PasswordService;

  const sessionService = {
    revokeAllForUser: jest.fn(),
  } as unknown as SessionService;

  const sessionRepository = {
    revoke: jest.fn(),
  } as unknown as SessionRepository;

  const refreshTokenRepository = {
    revoke: jest.fn(),
  } as unknown as RefreshTokenRepository;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;
  const securityLogger = { record: jest.fn() } as unknown as SecurityLoggerService;

  const service = new UsersService(
    usersRepository,
    userSessionsRepository,
    new UsersValidator(),
    new UsersMapper(),
    passwordService,
    sessionService,
    sessionRepository,
    refreshTokenRepository,
    auditLogger,
    securityLogger
  );

  return {
    service,
    usersRepository,
    userSessionsRepository,
    passwordService,
    sessionService,
    sessionRepository,
    refreshTokenRepository,
  };
}

describe('UsersService', () => {
  describe('createUser', () => {
    it('rejects a duplicate email', async () => {
      const { service, usersRepository } = buildService();
      (usersRepository.findByEmail as jest.Mock).mockResolvedValue(buildUser());
      await expect(service.createUser({ email: 'a@b.com' }, 'actor-1')).rejects.toThrow(
        UserConflictException
      );
    });

    it('hashes the password and creates the user', async () => {
      const { service, usersRepository, passwordService } = buildService();
      (usersRepository.create as jest.Mock).mockResolvedValue(buildUser());
      await service.createUser({ email: 'a@b.com', password: 'Sup3r$ecret' }, 'actor-1');
      expect(passwordService.hash).toHaveBeenCalledWith('Sup3r$ecret');
      expect(usersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'a@b.com',
          passwordHash: 'new-hash',
          createdBy: 'actor-1',
        })
      );
    });
  });

  describe('getUser', () => {
    it('throws UserNotFoundException when missing', async () => {
      const { service, usersRepository } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getUser('missing')).rejects.toThrow(UserNotFoundException);
    });

    it('maps a found user', async () => {
      const { service, usersRepository } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      const result = await service.getUser('user-1');
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('a@b.com');
    });
  });

  describe('softDeleteUser', () => {
    it('rejects an already-deleted user', async () => {
      const { service, usersRepository } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(
        buildUser({ deletedAt: new Date() })
      );
      await expect(service.softDeleteUser('user-1', 'actor-1')).rejects.toThrow(
        UserAlreadyDeletedException
      );
    });

    it('soft-deletes and revokes all sessions', async () => {
      const { service, usersRepository, sessionService } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      (usersRepository.softDelete as jest.Mock).mockResolvedValue(
        buildUser({ deletedAt: new Date() })
      );
      await service.softDeleteUser('user-1', 'actor-1');
      expect(sessionService.revokeAllForUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('restoreUser', () => {
    it('rejects a user that is not deleted', async () => {
      const { service, usersRepository } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      await expect(service.restoreUser('user-1', 'actor-1')).rejects.toThrow(
        UserNotDeletedException
      );
    });
  });

  describe('lockUser / unlockUser', () => {
    it('locks a user, merging metadata.security and revoking sessions', async () => {
      const { service, usersRepository, sessionService } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      (usersRepository.update as jest.Mock).mockResolvedValue(
        buildUser({ metadata: { security: { locked: true } } })
      );
      const result = await service.lockUser('user-1', 'too many failed logins', 'admin-1');
      expect(usersRepository.update).toHaveBeenCalledWith(
        'user-1',
        {
          metadata: expect.objectContaining({
            security: expect.objectContaining({ locked: true }),
          }),
        },
        'admin-1'
      );
      expect(sessionService.revokeAllForUser).toHaveBeenCalledWith('user-1');
      expect(result.locked).toBe(true);
    });
  });

  describe('changePassword', () => {
    it('rejects an incorrect current password', async () => {
      const { service, usersRepository, passwordService } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      (passwordService.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.changePassword('user-1', { currentPassword: 'wrong', newPassword: 'New$ecret1' })
      ).rejects.toThrow(InvalidCurrentPasswordException);
    });

    it('changes the password and revokes all sessions', async () => {
      const { service, usersRepository, sessionService, passwordService } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      await service.changePassword('user-1', {
        currentPassword: 'correct',
        newPassword: 'New$ecret1',
      });
      expect(passwordService.hash).toHaveBeenCalledWith('New$ecret1');
      expect(usersRepository.updatePasswordHash).toHaveBeenCalledWith(
        'user-1',
        'new-hash',
        'user-1'
      );
      expect(sessionService.revokeAllForUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('adminResetPassword', () => {
    it('resets without checking a current password', async () => {
      const { service, usersRepository, passwordService, sessionService } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      await service.adminResetPassword('user-1', { newPassword: 'New$ecret1' }, 'admin-1');
      expect(passwordService.hash).toHaveBeenCalledWith('New$ecret1');
      expect(usersRepository.updatePasswordHash).toHaveBeenCalledWith(
        'user-1',
        'new-hash',
        'admin-1'
      );
      expect(sessionService.revokeAllForUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('terminateSession', () => {
    it('throws SessionNotFoundException when the session belongs to a different user', async () => {
      const { service, usersRepository, userSessionsRepository } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      (userSessionsRepository.findById as jest.Mock).mockResolvedValue({
        id: 'session-1',
        userId: 'someone-else',
      });
      await expect(service.terminateSession('user-1', 'session-1', 'admin-1')).rejects.toThrow(
        SessionNotFoundException
      );
    });

    it('revokes the session and its refresh token', async () => {
      const {
        service,
        usersRepository,
        userSessionsRepository,
        sessionRepository,
        refreshTokenRepository,
      } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      (userSessionsRepository.findById as jest.Mock).mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        refreshTokenId: 'refresh-1',
      });
      await service.terminateSession('user-1', 'session-1', 'admin-1');
      expect(sessionRepository.revoke).toHaveBeenCalledWith('session-1');
      expect(refreshTokenRepository.revoke).toHaveBeenCalledWith(
        'refresh-1',
        'admin_terminate_session'
      );
    });
  });

  describe('updateAvatar', () => {
    it('rejects a non-existent media asset', async () => {
      const { service, usersRepository } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      (usersRepository.findMediaAssetById as jest.Mock).mockResolvedValue(null);
      await expect(service.updateAvatar('user-1', { mediaAssetId: 'media-1' })).rejects.toThrow();
    });

    it('sets profileImageId when the media asset exists', async () => {
      const { service, usersRepository } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(buildUser());
      (usersRepository.findMediaAssetById as jest.Mock).mockResolvedValue({ id: 'media-1' });
      (usersRepository.update as jest.Mock).mockResolvedValue(
        buildUser({ profileImageId: 'media-1' })
      );
      const result = await service.updateAvatar('user-1', { mediaAssetId: 'media-1' });
      expect(usersRepository.update).toHaveBeenCalledWith(
        'user-1',
        { profileImageId: 'media-1' },
        'user-1'
      );
      expect(result.profileImageId).toBe('media-1');
    });
  });

  describe('updateProfile / updatePreferences', () => {
    it('merges a profile patch into existing metadata', async () => {
      const { service, usersRepository } = buildService();
      (usersRepository.findById as jest.Mock).mockResolvedValue(
        buildUser({ metadata: { profile: { firstName: 'Old' } } })
      );
      (usersRepository.update as jest.Mock).mockResolvedValue(
        buildUser({ metadata: { profile: { firstName: 'Old', lastName: 'New' } } })
      );
      await service.updateProfile('user-1', { lastName: 'New' });
      expect(usersRepository.update).toHaveBeenCalledWith(
        'user-1',
        { metadata: expect.objectContaining({ profile: { firstName: 'Old', lastName: 'New' } }) },
        'user-1'
      );
    });
  });
});
