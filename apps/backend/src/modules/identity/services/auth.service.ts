import { HttpStatus, Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { AppConfigService } from '../../../config/config.service';
import { AuthenticationErrorCode } from '../../../core/exceptions/codes';
import { AuthenticationException } from '../../../core/exceptions/authentication.exception';
import { AppLoggerService } from '../../../core/logger/app-logger.service';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { AuthTokensDto } from '../dto/auth-tokens.dto';
import { CurrentUserDto } from '../dto/current-user.dto';
import { EmailRequestDto } from '../dto/email-request.dto';
import { LoginDto } from '../dto/login.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { RequestContext } from '../interfaces/request-context.interface';
import { UserRepository } from '../repositories/user.repository';
import { EmailVerificationService } from './email-verification.service';
import { PasswordResetService } from './password-reset.service';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';

type TokenDeliveryKind = 'password_reset' | 'email_verification';

/**
 * Orchestrates the 8 auth endpoints. Deliberately thin business logic per
 * the milestone's scope — real work (hashing, token lifecycle, session
 * bookkeeping) lives in the injected services/repositories below.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly passwordResetService: PasswordResetService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly auditLogger: AuditLoggerService,
    private readonly logger: AppLoggerService,
    private readonly config: AppConfigService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async login(dto: LoginDto, context: RequestContext): Promise<AuthTokensDto> {
    const user = await this.userRepository.findActiveByEmail(dto.email);
    const passwordMatches =
      user?.passwordHash && (await this.passwordService.compare(dto.password, user.passwordHash));

    if (!user || !passwordMatches) {
      throw new AuthenticationException(
        AuthenticationErrorCode.UNAUTHORIZED,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (user.status !== 'ACTIVE') {
      throw new AuthenticationException(
        AuthenticationErrorCode.UNAUTHORIZED,
        'Account is not active',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { token: accessToken, expiresIn } = this.tokenService.signAccessToken(user);
    const { refreshToken } = await this.sessionService.createSession(
      user.id,
      context,
      dto.rememberMe ?? false,
    );
    await this.userRepository.updateLastLogin(user.id);

    this.auditLogger.record({
      actorId: user.id,
      action: 'login',
      resource: 'user',
      resourceId: user.id,
      result: 'success',
    });

    return this.buildTokensResponse(accessToken, expiresIn, refreshToken, user);
  }

  async logout(dto: RefreshTokenDto): Promise<MessageResponseDto> {
    const userId = await this.sessionService.revokeByRefreshToken(dto.refreshToken);
    this.auditLogger.record({
      actorId: userId,
      action: 'logout',
      resource: 'session',
      result: 'success',
    });
    return { message: 'Logged out successfully.' };
  }

  async refresh(dto: RefreshTokenDto, context: RequestContext): Promise<AuthTokensDto> {
    const rotated = await this.sessionService.rotateSession(dto.refreshToken, context);
    const user = await this.userRepository.findActiveById(rotated.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new AuthenticationException(
        AuthenticationErrorCode.UNAUTHORIZED,
        'Account is not active',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const { token: accessToken, expiresIn } = this.tokenService.signAccessToken(user);

    this.auditLogger.record({
      actorId: user.id,
      action: 'refresh_token_rotation',
      resource: 'session',
      result: 'success',
    });

    return this.buildTokensResponse(accessToken, expiresIn, rotated.refreshToken, user);
  }

  /** Always returns a generic message — never reveals whether the email exists. */
  async forgotPassword(dto: EmailRequestDto): Promise<MessageResponseDto> {
    const user = await this.userRepository.findActiveByEmail(dto.email);
    if (user) {
      const token = await this.passwordResetService.createResetToken(user.id);
      this.deliverToken('password_reset', user.email, token);
      this.auditLogger.record({
        actorId: user.id,
        action: 'password_reset_requested',
        resource: 'user',
        resourceId: user.id,
        result: 'success',
      });
    }
    return { message: 'If an account exists for this email, a password reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<MessageResponseDto> {
    const userId = await this.passwordResetService.consumeResetToken(dto.token);
    const passwordHash = await this.passwordService.hash(dto.newPassword);
    await this.userRepository.updatePasswordHash(userId, passwordHash);
    await this.sessionService.revokeAllForUser(userId);

    this.auditLogger.record({
      actorId: userId,
      action: 'password_changed',
      resource: 'user',
      resourceId: userId,
      result: 'success',
    });

    return { message: 'Password has been reset successfully. Please log in again.' };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<MessageResponseDto> {
    const userId = await this.emailVerificationService.verify(dto.token);

    this.auditLogger.record({
      actorId: userId,
      action: 'email_verified',
      resource: 'user',
      resourceId: userId,
      result: 'success',
    });

    return { message: 'Email verified successfully.' };
  }

  /** Always returns a generic message — never reveals whether the email exists. */
  async resendVerification(dto: EmailRequestDto): Promise<MessageResponseDto> {
    const user = await this.userRepository.findActiveByEmail(dto.email);
    if (user) {
      const token = await this.emailVerificationService.createVerificationToken(user.id);
      this.deliverToken('email_verification', user.email, token);
    }
    return { message: 'If an account exists for this email, a verification link has been sent.' };
  }

  getCurrentUser(user: AuthenticatedUser): CurrentUserDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      status: user.status,
    };
  }

  private buildTokensResponse(
    accessToken: string,
    expiresIn: string,
    refreshToken: string,
    user: User,
  ): AuthTokensDto {
    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        status: user.status,
      },
    };
  }

  /** No EmailProvider is wired yet (interface only, per this milestone's
   * scope) — logs the generated token instead of sending it. The raw token
   * is only logged outside production, so local/dev testing can complete
   * the flow manually without a real mailbox. */
  private deliverToken(kind: TokenDeliveryKind, email: string, token: string): void {
    const isProduction = this.config.app.env === 'production';
    this.logger.log(`${kind} token generated (no EmailProvider configured yet)`, {
      kind,
      email,
      token: isProduction ? undefined : token,
    });
  }
}
