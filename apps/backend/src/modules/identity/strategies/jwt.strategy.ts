import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from '../../../config/config.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserRepository } from '../repositories/user.repository';

/**
 * Verifies the access token's signature/expiry (Passport), then loads the
 * user from the database so a deleted/suspended account is rejected even
 * with an otherwise-valid, unexpired token — unlike the Milestone 2
 * placeholder, which returned the raw payload with no DB lookup.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: AppConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.auth.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findActiveById(payload.sub);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      status: user.status,
      siteId: user.siteId,
      tenantId: user.tenantId,
    };
  }
}
