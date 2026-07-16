import { HttpStatus, Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/config.service';
import { AuthenticationErrorCode } from '../../../core/exceptions/codes';
import { AuthenticationException } from '../../../core/exceptions/authentication.exception';
import { EmailVerificationRepository } from '../repositories/email-verification.repository';
import { UserRepository } from '../repositories/user.repository';
import { addDuration } from '../utils/duration.util';
import { TokenService } from './token.service';

/** Foundation only (§7): generates/validates a verification token. No email
 * is sent — no EmailProvider is wired yet (interface only). */
@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly repository: EmailVerificationRepository,
    private readonly userRepository: UserRepository,
    private readonly config: AppConfigService,
  ) {}

  async createVerificationToken(userId: string): Promise<string> {
    const { token, tokenHash } = this.tokenService.generateOpaqueToken();
    const expiresAt = addDuration(this.config.auth.emailVerificationTokenExpiresIn);
    await this.repository.create({ userId, tokenHash, expiresAt });
    return token;
  }

  /** Marks the token verified and activates a still-PENDING account. */
  async verify(token: string): Promise<string> {
    const tokenHash = this.tokenService.hashToken(token);
    const record = await this.repository.findValidByHash(tokenHash);
    if (!record) {
      throw new AuthenticationException(
        AuthenticationErrorCode.TOKEN_INVALID,
        'Invalid or expired verification token',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.repository.markVerified(record.id);
    await this.userRepository.activateIfPending(record.userId);
    return record.userId;
  }
}
