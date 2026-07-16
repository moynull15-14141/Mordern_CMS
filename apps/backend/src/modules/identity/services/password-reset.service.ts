import { HttpStatus, Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/config.service';
import { AuthenticationErrorCode } from '../../../core/exceptions/codes';
import { AuthenticationException } from '../../../core/exceptions/authentication.exception';
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';
import { addDuration } from '../utils/duration.util';
import { TokenService } from './token.service';

/** Foundation only (§8): generates/validates/expires/single-uses a reset
 * token. No email is sent — no EmailProvider is wired yet (interface only,
 * per the milestone's do-not-implement list). */
@Injectable()
export class PasswordResetService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly repository: PasswordResetTokenRepository,
    private readonly config: AppConfigService,
  ) {}

  async createResetToken(userId: string): Promise<string> {
    const { token, tokenHash } = this.tokenService.generateOpaqueToken();
    const expiresAt = addDuration(this.config.auth.passwordResetTokenExpiresIn);
    await this.repository.create({ userId, tokenHash, expiresAt });
    return token;
  }

  /** Single-use: marks the token consumed and returns the owning user id. */
  async consumeResetToken(token: string): Promise<string> {
    const tokenHash = this.tokenService.hashToken(token);
    const record = await this.repository.findValidByHash(tokenHash);
    if (!record) {
      throw new AuthenticationException(
        AuthenticationErrorCode.TOKEN_INVALID,
        'Invalid or expired reset token',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.repository.markUsed(record.id);
    return record.userId;
  }
}
