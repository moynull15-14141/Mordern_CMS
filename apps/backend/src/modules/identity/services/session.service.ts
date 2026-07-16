import { HttpStatus, Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/config.service';
import { AuthenticationErrorCode } from '../../../core/exceptions/codes';
import { AuthenticationException } from '../../../core/exceptions/authentication.exception';
import { RequestContext } from '../interfaces/request-context.interface';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { SessionRepository } from '../repositories/session.repository';
import { TokenService } from './token.service';
import { addDuration } from '../utils/duration.util';

export interface IssuedSession {
  refreshToken: string;
  expiresAt: Date;
}

export interface RotatedSession extends IssuedSession {
  userId: string;
}

/**
 * Orchestrates the Session + RefreshToken pair as a unit (§5/§6): every
 * refresh token has exactly one active session tracking its device/network
 * context, and both are created/revoked together.
 */
@Injectable()
export class SessionService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly config: AppConfigService,
  ) {}

  async createSession(
    userId: string,
    context: RequestContext,
    rememberMe: boolean,
  ): Promise<IssuedSession> {
    const duration = rememberMe
      ? this.config.auth.rememberMeExpiresIn
      : this.config.auth.jwtRefreshExpiresIn;
    const expiresAt = addDuration(duration);

    const { token: refreshToken, tokenHash } = this.tokenService.generateOpaqueToken();
    const refreshTokenRecord = await this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });
    await this.sessionRepository.create({
      userId,
      refreshTokenId: refreshTokenRecord.id,
      expiresAt,
      context,
      rememberMe,
    });

    return { refreshToken, expiresAt };
  }

  /**
   * Rotation per §6/Milestone 4.1 §7 (the official, sole refresh-token
   * strategy — no blacklist): old token revoked, new one issued, old
   * session revoked and replaced. A reused (already-rotated) refresh token
   * is rejected by findActiveOrThrow, since revoke() clears its "active"
   * status. Duration always uses the standard (non-remember-me) expiry on
   * rotation, unchanged from the original login choice's business rule —
   * only the `rememberMe` metadata flag is carried forward for record
   * accuracy.
   */
  async rotateSession(currentRefreshToken: string, context: RequestContext): Promise<RotatedSession> {
    const existing = await this.findActiveOrThrow(currentRefreshToken);

    await this.refreshTokenRepository.revoke(existing.id, 'rotated');
    const session = await this.sessionRepository.findActiveByRefreshTokenId(existing.id);
    if (session) {
      await this.sessionRepository.revoke(session.id);
    }

    const expiresAt = addDuration(this.config.auth.jwtRefreshExpiresIn);
    const { token: newRefreshToken, tokenHash } = this.tokenService.generateOpaqueToken();
    const newRecord = await this.refreshTokenRepository.create({
      userId: existing.userId,
      tokenHash,
      expiresAt,
    });
    await this.sessionRepository.create({
      userId: existing.userId,
      refreshTokenId: newRecord.id,
      expiresAt,
      context,
      rememberMe: session?.rememberMe ?? false,
    });

    return { userId: existing.userId, refreshToken: newRefreshToken, expiresAt };
  }

  async revokeByRefreshToken(refreshToken: string): Promise<string> {
    const existing = await this.findActiveOrThrow(refreshToken);
    await this.refreshTokenRepository.revoke(existing.id, 'logout');
    const session = await this.sessionRepository.findActiveByRefreshTokenId(existing.id);
    if (session) {
      await this.sessionRepository.revoke(session.id);
    }
    return existing.userId;
  }

  /** Used on password change — invalidates every existing session (§8). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllForUser(userId, 'password_reset');
    await this.sessionRepository.revokeAllForUser(userId);
  }

  private async findActiveOrThrow(refreshToken: string) {
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const existing = await this.refreshTokenRepository.findActiveByHash(tokenHash);
    if (!existing) {
      throw new AuthenticationException(
        AuthenticationErrorCode.TOKEN_INVALID,
        'Invalid or expired refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return existing;
  }
}
