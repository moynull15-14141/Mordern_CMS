import type { AppConfigService } from '../../../config/config.service';
import { AuthenticationException } from '../../../core/exceptions/authentication.exception';
import type { AppLoggerService } from '../../../core/logger/app-logger.service';
import type { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import type { RequestContext } from '../interfaces/request-context.interface';
import type { UserRepository } from '../repositories/user.repository';
import { AuthService } from './auth.service';
import type { EmailVerificationService } from './email-verification.service';
import type { PasswordResetService } from './password-reset.service';
import type { PasswordService } from './password.service';
import type { SessionService } from './session.service';
import type { TokenService } from './token.service';

const NO_CONTEXT: RequestContext = { ipAddress: null, userAgent: null, deviceName: null };

const ACTIVE_USER = {
  id: 'user-1',
  email: 'user@example.com',
  username: null,
  displayName: null,
  status: 'ACTIVE' as const,
  passwordHash: 'hashed',
};

interface Mocks {
  userRepository: Record<string, jest.Mock>;
  passwordService: Record<string, jest.Mock>;
  tokenService: Record<string, jest.Mock>;
  sessionService: Record<string, jest.Mock>;
  passwordResetService: Record<string, jest.Mock>;
  emailVerificationService: Record<string, jest.Mock>;
  auditLogger: Record<string, jest.Mock>;
  logger: Record<string, jest.Mock>;
}

function buildService(overrides: Partial<Mocks> = {}) {
  const mocks: Mocks = {
    userRepository: {},
    passwordService: {},
    tokenService: {},
    sessionService: {},
    passwordResetService: {},
    emailVerificationService: {},
    auditLogger: { record: jest.fn() },
    logger: { setContext: jest.fn(), log: jest.fn() },
    ...overrides,
  };
  const config = { app: { env: 'test' } } as unknown as AppConfigService;

  const service = new AuthService(
    mocks.userRepository as unknown as UserRepository,
    mocks.passwordService as unknown as PasswordService,
    mocks.tokenService as unknown as TokenService,
    mocks.sessionService as unknown as SessionService,
    mocks.passwordResetService as unknown as PasswordResetService,
    mocks.emailVerificationService as unknown as EmailVerificationService,
    mocks.auditLogger as unknown as AuditLoggerService,
    mocks.logger as unknown as AppLoggerService,
    config,
  );

  return { service, ...mocks };
}

describe('AuthService', () => {
  describe('login', () => {
    it('returns tokens and updates last-login for a valid active user', async () => {
      const { service, userRepository } = buildService({
        userRepository: {
          findActiveByEmail: jest.fn().mockResolvedValue(ACTIVE_USER),
          updateLastLogin: jest.fn().mockResolvedValue(undefined),
        },
        passwordService: { compare: jest.fn().mockResolvedValue(true) },
        tokenService: {
          signAccessToken: jest.fn().mockReturnValue({ token: 'access-token', expiresIn: '15m' }),
        },
        sessionService: {
          createSession: jest.fn().mockResolvedValue({ refreshToken: 'refresh-token' }),
        },
      });

      const result = await service.login(
        { email: 'user@example.com', password: 'correct' } as never,
        NO_CONTEXT,
      );

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.id).toBe('user-1');
      expect(userRepository.updateLastLogin).toHaveBeenCalledWith('user-1');
    });

    it('throws AuthenticationException for an unknown email', async () => {
      const { service } = buildService({
        userRepository: { findActiveByEmail: jest.fn().mockResolvedValue(null) },
      });

      await expect(
        service.login({ email: 'nobody@example.com', password: 'x' } as never, NO_CONTEXT),
      ).rejects.toThrow(AuthenticationException);
    });

    it('throws AuthenticationException for a wrong password', async () => {
      const { service } = buildService({
        userRepository: { findActiveByEmail: jest.fn().mockResolvedValue(ACTIVE_USER) },
        passwordService: { compare: jest.fn().mockResolvedValue(false) },
      });

      await expect(
        service.login({ email: 'user@example.com', password: 'wrong' } as never, NO_CONTEXT),
      ).rejects.toThrow(AuthenticationException);
    });

    it('throws AuthenticationException for a non-ACTIVE account', async () => {
      const { service } = buildService({
        userRepository: {
          findActiveByEmail: jest.fn().mockResolvedValue({ ...ACTIVE_USER, status: 'SUSPENDED' }),
        },
        passwordService: { compare: jest.fn().mockResolvedValue(true) },
      });

      await expect(
        service.login({ email: 'user@example.com', password: 'correct' } as never, NO_CONTEXT),
      ).rejects.toThrow(AuthenticationException);
    });
  });

  describe('forgotPassword', () => {
    it('does not create a token and still returns a generic message when the user does not exist', async () => {
      const createResetToken = jest.fn();
      const { service } = buildService({
        userRepository: { findActiveByEmail: jest.fn().mockResolvedValue(null) },
        passwordResetService: { createResetToken },
      });

      const result = await service.forgotPassword({ email: 'nobody@example.com' });

      expect(createResetToken).not.toHaveBeenCalled();
      expect(result.message).toMatch(/if an account exists/i);
    });

    it('creates a reset token when the user exists, keeping the response generic either way', async () => {
      const createResetToken = jest.fn().mockResolvedValue('reset-token');
      const { service } = buildService({
        userRepository: { findActiveByEmail: jest.fn().mockResolvedValue(ACTIVE_USER) },
        passwordResetService: { createResetToken },
      });

      const result = await service.forgotPassword({ email: 'user@example.com' });

      expect(createResetToken).toHaveBeenCalledWith('user-1');
      expect(result.message).toMatch(/if an account exists/i);
    });
  });

  describe('resetPassword', () => {
    it('hashes the new password, updates the user, and revokes all sessions', async () => {
      const updatePasswordHash = jest.fn();
      const revokeAllForUser = jest.fn();
      const { service } = buildService({
        passwordResetService: { consumeResetToken: jest.fn().mockResolvedValue('user-1') },
        passwordService: { hash: jest.fn().mockResolvedValue('new-hash') },
        userRepository: { updatePasswordHash },
        sessionService: { revokeAllForUser },
      });

      await service.resetPassword({ token: 'reset-token', newPassword: 'StrongP@ss1' });

      expect(updatePasswordHash).toHaveBeenCalledWith('user-1', 'new-hash');
      expect(revokeAllForUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('verifyEmail', () => {
    it('delegates to EmailVerificationService and logs the audit event', async () => {
      const record = jest.fn();
      const { service } = buildService({
        emailVerificationService: { verify: jest.fn().mockResolvedValue('user-1') },
        auditLogger: { record },
      });

      const result = await service.verifyEmail({ token: 'verify-token' });

      expect(record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'email_verified', actorId: 'user-1' }),
      );
      expect(result.message).toMatch(/verified/i);
    });
  });

  describe('logout', () => {
    it('revokes the session tied to the given refresh token', async () => {
      const revokeByRefreshToken = jest.fn().mockResolvedValue('user-1');
      const { service } = buildService({ sessionService: { revokeByRefreshToken } });

      const result = await service.logout({ refreshToken: 'refresh-token' });

      expect(revokeByRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(result.message).toMatch(/logged out/i);
    });
  });
});
