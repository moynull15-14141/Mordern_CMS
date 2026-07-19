import { Module } from '@nestjs/common';
import { ThemesModule } from '../themes/themes.module';
import { PublicSiteController } from './controllers/public-site.controller';
import { SiteRepository } from './repositories/site.repository';
import { PublicSiteService } from './services/public-site.service';

/**
 * Public Site Foundation (Milestone 13.2,
 * docs/75_BACKEND_PUBLIC_CONTENT_API.md) — public read-only, no admin
 * counterpart exists yet (no `Site` CRUD anywhere in this backend). No
 * `AuthorizationModule` import — every route here is `@Public()`, nothing
 * to guard. Imports `ThemesModule` to reuse its exported
 * `PublicThemesService` for the active-theme reference instead of
 * re-querying `Theme`.
 */
@Module({
  imports: [ThemesModule],
  controllers: [PublicSiteController],
  providers: [SiteRepository, PublicSiteService],
  exports: [PublicSiteService],
})
export class SiteModule {}
