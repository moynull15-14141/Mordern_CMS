import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { IdentityModule } from '../identity/identity.module';
import { PasswordService } from '../identity/services/password.service';
import { SessionService } from '../identity/services/session.service';
import { TokenService } from '../identity/services/token.service';
import { SessionRepository } from '../identity/repositories/session.repository';
import { RefreshTokenRepository } from '../identity/repositories/refresh-token.repository';
import { UsersController } from './controllers/users.controller';
import { UsersRepository } from './repositories/users.repository';
import { UserSessionsRepository } from './repositories/user-sessions.repository';
import { UsersValidator } from './validators/users.validator';
import { UsersMapper } from './mappers/users.mapper';
import { UsersService } from './services/users.service';

/**
 * User Management foundation (Milestone 7). `IdentityModule` is imported
 * only to gain its exported `JwtModule` (so `TokenService`'s `JwtService`
 * dependency resolves) — `IdentityModule`'s own file is never edited, since
 * it is frozen (`37_IDENTITY_FREEZE.md`). `PasswordService`/`SessionService`/
 * `TokenService`/`SessionRepository`/`RefreshTokenRepository` are the exact
 * same classes Identity uses, re-provided here (not duplicated) because
 * `IdentityModule` doesn't export them — see
 * docs/42_USER_MANAGEMENT_ARCHITECTURE.md "Reuse Strategy".
 */
@Module({
  imports: [IdentityModule, AuthorizationModule],
  controllers: [UsersController],
  providers: [
    UsersRepository,
    UserSessionsRepository,
    UsersValidator,
    UsersMapper,
    UsersService,
    PasswordService,
    TokenService,
    SessionRepository,
    RefreshTokenRepository,
    SessionService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
