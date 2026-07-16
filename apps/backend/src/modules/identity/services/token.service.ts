import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { AppConfigService } from '../../../config/config.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface AccessToken {
  token: string;
  expiresIn: string;
}

export interface OpaqueToken {
  token: string;
  tokenHash: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
  ) {}

  /**
   * `role` is always null here — no Roles module exists yet (Milestone 4.1
   * §2). The field only reserves the claim shape; nothing reads it for
   * authorization. `email`/`siteId` come straight from the already-loaded
   * User row at the call site, so this never triggers an extra query.
   */
  signAccessToken(user: { id: string; email: string; siteId: string | null }): AccessToken {
    const expiresIn = this.config.auth.jwtAccessExpiresIn;
    const payload: JwtPayload = { sub: user.id, email: user.email, role: null, siteId: user.siteId };
    const token = this.jwtService.sign(payload, { expiresIn: expiresIn as unknown as number });
    return { token, expiresIn };
  }

  /** Refresh/reset/verification tokens are high-entropy opaque strings, not
   * JWTs — matches the RefreshToken/PasswordResetToken/EmailVerification
   * table design (token_hash column, no claims to decode). */
  generateOpaqueToken(): OpaqueToken {
    const token = randomBytes(48).toString('hex');
    return { token, tokenHash: this.hashToken(token) };
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
