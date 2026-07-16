import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../../config/config.module';
import { AppConfigService } from '../../config/config.service';
import { AuthController } from './controllers/auth.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { EmailVerificationRepository } from './repositories/email-verification.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { SessionRepository } from './repositories/session.repository';
import { UserRepository } from './repositories/user.repository';
import { AuthService } from './services/auth.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * Identity & Authentication Foundation (Milestone 4). Owns the auth engine
 * only — no User/Role/Permission CRUD, no admin panel, no RBAC business
 * logic. Supersedes the Milestone 2 `modules/auth` skeleton entirely.
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.auth.jwtSecret,
        signOptions: { expiresIn: config.auth.jwtAccessExpiresIn as unknown as number },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    UserRepository,
    SessionRepository,
    RefreshTokenRepository,
    PasswordResetTokenRepository,
    EmailVerificationRepository,
    PasswordService,
    TokenService,
    SessionService,
    PasswordResetService,
    EmailVerificationService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    OptionalAuthGuard,
  ],
  exports: [JwtAuthGuard, OptionalAuthGuard, JwtModule],
})
export class IdentityModule {}
