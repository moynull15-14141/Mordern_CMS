import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { RedirectsController } from './controllers/redirects.controller';
import { PublicRedirectsController } from './controllers/public-redirects.controller';
import { RedirectsRepository } from './repositories/redirects.repository';
import { RedirectsMapper } from './mappers/redirects.mapper';
import { RedirectsService } from './services/redirects.service';
import { PublicRedirectsService } from './services/public-redirects.service';

/**
 * Redirect Management (Step 2 URL/SEO milestone) — the `Redirect` Prisma
 * model already existed with zero implementation (Phase 0 audit); this
 * module is the first code to actually read/write it. `PublicRedirectsController`
 * is `@Public()` and never touches `PermissionGuard`, mirroring every
 * other `Public*Controller` in this codebase.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [RedirectsController, PublicRedirectsController],
  providers: [RedirectsRepository, RedirectsMapper, RedirectsService, PublicRedirectsService],
  exports: [PublicRedirectsService],
})
export class RedirectsModule {}
