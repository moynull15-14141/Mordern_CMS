import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { PagesController } from './controllers/pages.controller';
import { PublicPagesController } from './controllers/public-pages.controller';
import { PagesRepository } from './repositories/pages.repository';
import { PagesValidator } from './validators/pages.validator';
import { PagesMapper } from './mappers/pages.mapper';
import { PublicPagesMapper } from './mappers/public-pages.mapper';
import { PagesService } from './services/pages.service';
import { PublicPagesService } from './services/public-pages.service';

/**
 * Pages Foundation. Depends on AuthorizationModule for `PermissionGuard`
 * (`page.manage`) — used only by `PagesController`; `PublicPagesController`
 * (Milestone 13.2) is `@Public()` and never touches it. PrismaService is
 * injected via the already-@Global() DatabaseModule. See
 * docs/69_BACKEND_PAGES.md, docs/75_BACKEND_PUBLIC_CONTENT_API.md.
 * `PublicPagesService` is exported for `SeoModule`'s
 * `GET /public/seo/page/:slug` composition (slug -> published page id).
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [PagesController, PublicPagesController],
  providers: [
    PagesRepository,
    PagesValidator,
    PagesMapper,
    PagesService,
    PublicPagesMapper,
    PublicPagesService,
  ],
  exports: [PagesService, PublicPagesService],
})
export class PagesModule {}
