import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ThemesController } from './controllers/themes.controller';
import { PublicThemesController } from './controllers/public-themes.controller';
import { ThemesRepository } from './repositories/themes.repository';
import { ThemesValidator } from './validators/themes.validator';
import { ThemesMapper } from './mappers/themes.mapper';
import { ThemesService } from './services/themes.service';
import { PublicThemesService } from './services/public-themes.service';

/**
 * Themes / Appearance Foundation (Backend Milestone 12). Depends on
 * AuthorizationModule for `PermissionGuard` (`theme.manage`) — used only
 * by `ThemesController`; `PublicThemesController` is `@Public()` and
 * never touches it. PrismaService is injected via the already-@Global()
 * DatabaseModule. See docs/72_BACKEND_THEMES.md.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [ThemesController, PublicThemesController],
  providers: [ThemesRepository, ThemesValidator, ThemesMapper, ThemesService, PublicThemesService],
  exports: [ThemesService, PublicThemesService],
})
export class ThemesModule {}
