import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SettingsController } from './controllers/settings.controller';
import { PublicSettingsController } from './controllers/public-settings.controller';
import { SettingsRepository } from './repositories/settings.repository';
import { SettingsValidator } from './validators/settings.validator';
import { SettingsMapper } from './mappers/settings.mapper';
import { SettingsService } from './services/settings.service';
import { PublicSettingsService } from './services/public-settings.service';

/**
 * Platform Settings & System Configuration Foundation (Milestone 6).
 * Foundation only: no frontend, no cache/history/encryption implementation
 * (interfaces only — see interfaces/), no new business modules. Depends on
 * AuthorizationModule for PermissionGuard (`settings.manage`) — PrismaService
 * is injected via the already-@Global() DatabaseModule, so no explicit
 * import is needed here. `PublicSettingsController` (Milestone 13.2,
 * docs/75_BACKEND_PUBLIC_CONTENT_API.md) is `@Public()` and never touches
 * `PermissionGuard`.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [SettingsController, PublicSettingsController],
  providers: [
    SettingsRepository,
    SettingsValidator,
    SettingsMapper,
    SettingsService,
    PublicSettingsService,
  ],
  exports: [SettingsService],
})
export class SettingsModule {}
