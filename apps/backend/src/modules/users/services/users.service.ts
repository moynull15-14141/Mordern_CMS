import { Injectable } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { SecurityLoggerService } from '../../../core/logger/security-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { PasswordService } from '../../identity/services/password.service';
import { SessionService } from '../../identity/services/session.service';
import { SessionRepository } from '../../identity/repositories/session.repository';
import { RefreshTokenRepository } from '../../identity/repositories/refresh-token.repository';
import { UsersRepository } from '../repositories/users.repository';
import { UserSessionsRepository } from '../repositories/user-sessions.repository';
import { UsersValidator } from '../validators/users.validator';
import { UsersMapper } from '../mappers/users.mapper';
import { UserMetadata } from '../interfaces/user-metadata.interface';
import { UserQueryOptions } from '../interfaces/user-query.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { UpdateAvatarDto } from '../dto/update-avatar.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AdminResetPasswordDto } from '../dto/admin-reset-password.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { SessionResponseDto } from '../dto/session-response.dto';
import { SESSION_REVOKE_REASON } from '../constants/user.constants';
import {
  InvalidCurrentPasswordException,
  MediaAssetNotFoundException,
  SessionNotFoundException,
  UserAlreadyDeletedException,
  UserConflictException,
  UserNotDeletedException,
  UserNotFoundException,
} from '../exceptions/user.exceptions';

/**
 * Orchestrates User CRUD, profile/preferences, sessions, and password
 * operations. Reuses Identity's PasswordService/SessionService/
 * SessionRepository/RefreshTokenRepository (re-provided in UsersModule,
 * since IdentityModule doesn't export them and Identity is frozen — see
 * docs/42_USER_MANAGEMENT_ARCHITECTURE.md "Reuse Strategy") rather than
 * duplicating hashing or session-revocation logic.
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userSessionsRepository: UserSessionsRepository,
    private readonly validator: UsersValidator,
    private readonly mapper: UsersMapper,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
    private readonly sessionRepository: SessionRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly auditLogger: AuditLoggerService,
    private readonly securityLogger: SecurityLoggerService
  ) {}

  private mergeMetadata(existing: UserMetadata, patch: Partial<UserMetadata>): UserMetadata {
    return {
      profile: patch.profile ? { ...existing.profile, ...patch.profile } : existing.profile,
      preferences: patch.preferences
        ? { ...existing.preferences, ...patch.preferences }
        : existing.preferences,
      security: patch.security ? { ...existing.security, ...patch.security } : existing.security,
    };
  }

  private async getUserOrThrow(id: string, includeDeleted = false) {
    const user = await this.usersRepository.findById(id, includeDeleted);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }

  async createUser(dto: CreateUserDto, actorId: string | null): Promise<UserResponseDto> {
    const existingByEmail = await this.usersRepository.findByEmail(dto.email);
    if (existingByEmail) {
      throw new UserConflictException('email', dto.email);
    }
    if (dto.username) {
      const existingByUsername = await this.usersRepository.findByUsername(dto.username);
      if (existingByUsername) {
        throw new UserConflictException('username', dto.username);
      }
    }

    const passwordHash = dto.password ? await this.passwordService.hash(dto.password) : null;
    const user = await this.usersRepository.create({
      email: dto.email,
      username: dto.username,
      displayName: dto.displayName,
      passwordHash,
      createdBy: actorId,
    });

    this.auditLogger.record({
      actorId: actorId ?? undefined,
      action: 'user.create',
      resource: 'user',
      resourceId: user.id,
      result: 'success',
    });
    return this.mapper.toResponseDto(user);
  }

  async getUser(id: string): Promise<UserResponseDto> {
    const user = await this.getUserOrThrow(id);
    return this.mapper.toResponseDto(user);
  }

  async listUsers(options: UserQueryOptions): Promise<PaginatedResult<UserResponseDto>> {
    const { items, total } = await this.usersRepository.findMany(options);
    return buildPaginatedResult(
      items.map((user) => this.mapper.toResponseDto(user)),
      options.page,
      options.limit,
      total
    );
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    actorId: string | null
  ): Promise<UserResponseDto> {
    await this.getUserOrThrow(id);
    if (dto.username) {
      const existing = await this.usersRepository.findByUsername(dto.username, id);
      if (existing) {
        throw new UserConflictException('username', dto.username);
      }
    }
    const user = await this.usersRepository.update(
      id,
      { username: dto.username, displayName: dto.displayName },
      actorId
    );
    this.auditLogger.record({
      actorId: actorId ?? undefined,
      action: 'user.update',
      resource: 'user',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(user);
  }

  async softDeleteUser(id: string, actorId: string | null): Promise<UserResponseDto> {
    const user = await this.getUserOrThrow(id);
    if (user.deletedAt) {
      throw new UserAlreadyDeletedException(id);
    }
    const deleted = await this.usersRepository.softDelete(id, actorId);
    await this.sessionService.revokeAllForUser(id);
    this.auditLogger.record({
      actorId: actorId ?? undefined,
      action: 'user.delete',
      resource: 'user',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(deleted);
  }

  async restoreUser(id: string, actorId: string | null): Promise<UserResponseDto> {
    const user = await this.getUserOrThrow(id, true);
    if (!user.deletedAt) {
      throw new UserNotDeletedException(id);
    }
    const restored = await this.usersRepository.restore(id, actorId);
    this.auditLogger.record({
      actorId: actorId ?? undefined,
      action: 'user.restore',
      resource: 'user',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(restored);
  }

  async activateUser(id: string, actorId: string | null): Promise<UserResponseDto> {
    await this.getUserOrThrow(id);
    const user = await this.usersRepository.update(id, { status: UserStatus.ACTIVE }, actorId);
    this.auditLogger.record({
      actorId: actorId ?? undefined,
      action: 'user.activate',
      resource: 'user',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(user);
  }

  async deactivateUser(id: string, actorId: string | null): Promise<UserResponseDto> {
    await this.getUserOrThrow(id);
    const user = await this.usersRepository.update(id, { status: UserStatus.INACTIVE }, actorId);
    await this.sessionService.revokeAllForUser(id);
    this.auditLogger.record({
      actorId: actorId ?? undefined,
      action: 'user.deactivate',
      resource: 'user',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(user);
  }

  /** LOCKED has no equivalent in the frozen UserStatus enum — tracked in
   * metadata.security instead. See docs/42_USER_MANAGEMENT_ARCHITECTURE.md
   * "User Status Conflict". Does not, by itself, block login at the auth
   * boundary (Identity's AuthService/JwtStrategy are frozen and untouched). */
  async lockUser(
    id: string,
    reason: string | undefined,
    actorId: string | null
  ): Promise<UserResponseDto> {
    const existing = await this.getUserOrThrow(id);
    const metadata = this.mergeMetadata((existing.metadata as UserMetadata | null) ?? {}, {
      security: {
        locked: true,
        lockedAt: new Date().toISOString(),
        lockedReason: reason,
        lockedBy: actorId,
      },
    });
    const user = await this.usersRepository.update(
      id,
      { metadata: metadata as unknown as Prisma.InputJsonValue },
      actorId
    );
    await this.sessionService.revokeAllForUser(id);
    this.securityLogger.record({ event: 'USER_LOCKED', path: `/users/${id}/lock` });
    return this.mapper.toResponseDto(user);
  }

  async unlockUser(id: string, actorId: string | null): Promise<UserResponseDto> {
    const existing = await this.getUserOrThrow(id);
    const metadata = this.mergeMetadata((existing.metadata as UserMetadata | null) ?? {}, {
      security: { locked: false, lockedAt: undefined, lockedReason: undefined, lockedBy: null },
    });
    const user = await this.usersRepository.update(
      id,
      { metadata: metadata as unknown as Prisma.InputJsonValue },
      actorId
    );
    this.auditLogger.record({
      actorId: actorId ?? undefined,
      action: 'user.unlock',
      resource: 'user',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.getUserOrThrow(userId);
    const matches = user.passwordHash
      ? await this.passwordService.compare(dto.currentPassword, user.passwordHash)
      : false;
    if (!matches) {
      throw new InvalidCurrentPasswordException();
    }
    const newHash = await this.passwordService.hash(dto.newPassword);
    await this.usersRepository.updatePasswordHash(userId, newHash, userId);
    await this.sessionService.revokeAllForUser(userId);
    this.auditLogger.record({
      actorId: userId,
      action: 'user.change_password',
      resource: 'user',
      resourceId: userId,
      result: 'success',
    });
  }

  async adminResetPassword(
    userId: string,
    dto: AdminResetPasswordDto,
    actorId: string | null
  ): Promise<void> {
    await this.getUserOrThrow(userId);
    const newHash = await this.passwordService.hash(dto.newPassword);
    await this.usersRepository.updatePasswordHash(userId, newHash, actorId);
    await this.sessionService.revokeAllForUser(userId);
    this.securityLogger.record({
      event: 'ADMIN_PASSWORD_RESET',
      path: `/users/${userId}/reset-password`,
    });
    this.auditLogger.record({
      actorId: actorId ?? undefined,
      action: 'user.admin_reset_password',
      resource: 'user',
      resourceId: userId,
      result: 'success',
    });
  }

  async updateAvatar(userId: string, dto: UpdateAvatarDto): Promise<UserResponseDto> {
    await this.getUserOrThrow(userId);
    const mediaAsset = await this.usersRepository.findMediaAssetById(dto.mediaAssetId);
    if (!mediaAsset) {
      throw new MediaAssetNotFoundException(dto.mediaAssetId);
    }
    const user = await this.usersRepository.update(
      userId,
      { profileImageId: dto.mediaAssetId },
      userId
    );
    return this.mapper.toResponseDto(user);
  }

  async removeAvatar(userId: string): Promise<UserResponseDto> {
    await this.getUserOrThrow(userId);
    const user = await this.usersRepository.update(userId, { profileImageId: null }, userId);
    return this.mapper.toResponseDto(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    this.validator.validateProfile(dto);
    const existing = await this.getUserOrThrow(userId);
    const metadata = this.mergeMetadata((existing.metadata as UserMetadata | null) ?? {}, {
      profile: dto,
    });
    const user = await this.usersRepository.update(
      userId,
      { metadata: metadata as unknown as Prisma.InputJsonValue },
      userId
    );
    return this.mapper.toResponseDto(user);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<UserResponseDto> {
    this.validator.validatePreferences(dto);
    const existing = await this.getUserOrThrow(userId);
    const metadata = this.mergeMetadata((existing.metadata as UserMetadata | null) ?? {}, {
      preferences: dto,
    });
    const user = await this.usersRepository.update(
      userId,
      { metadata: metadata as unknown as Prisma.InputJsonValue },
      userId
    );
    return this.mapper.toResponseDto(user);
  }

  async getSessions(userId: string): Promise<SessionResponseDto[]> {
    await this.getUserOrThrow(userId);
    const sessions = await this.userSessionsRepository.findAllForUser(userId);
    return sessions.map((session) => this.mapper.toSessionResponseDto(session));
  }

  async terminateSession(userId: string, sessionId: string, actorId: string | null): Promise<void> {
    await this.getUserOrThrow(userId);
    const session = await this.userSessionsRepository.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new SessionNotFoundException(sessionId);
    }
    await this.sessionRepository.revoke(session.id);
    if (session.refreshTokenId) {
      await this.refreshTokenRepository.revoke(
        session.refreshTokenId,
        actorId === userId
          ? SESSION_REVOKE_REASON.SELF_TERMINATE
          : SESSION_REVOKE_REASON.ADMIN_TERMINATE
      );
    }
    this.securityLogger.record({
      event: 'SESSION_TERMINATED',
      path: `/users/${userId}/sessions/${sessionId}`,
    });
  }

  async terminateAllSessions(userId: string, actorId: string | null): Promise<void> {
    await this.getUserOrThrow(userId);
    await this.sessionService.revokeAllForUser(userId);
    this.securityLogger.record({
      event: 'ALL_SESSIONS_TERMINATED',
      path: `/users/${userId}/sessions`,
    });
    this.auditLogger.record({
      actorId: actorId ?? undefined,
      action: 'user.terminate_all_sessions',
      resource: 'user',
      resourceId: userId,
      result: 'success',
    });
  }
}
