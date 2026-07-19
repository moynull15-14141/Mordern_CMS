import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { PagesModule } from '../pages/pages.module';
import { ArticlesModule } from '../articles/articles.module';
import { CategoriesModule } from '../categories/categories.module';
import { LayoutsController } from './controllers/layouts.controller';
import { LayoutAssignmentsController } from './controllers/layout-assignments.controller';
import { PublicLayoutsController } from './controllers/public-layouts.controller';
import { LayoutsRepository } from './repositories/layouts.repository';
import { LayoutAssignmentsRepository } from './repositories/layout-assignments.repository';
import { LayoutsValidator } from './validators/layouts.validator';
import { LayoutAssignmentsValidator } from './validators/layout-assignments.validator';
import { LayoutsMapper } from './mappers/layouts.mapper';
import { LayoutAssignmentsMapper } from './mappers/layout-assignments.mapper';
import { LayoutsService } from './services/layouts.service';
import { LayoutAssignmentsService } from './services/layout-assignments.service';
import { PublicLayoutsService } from './services/public-layouts.service';

/**
 * Layout Engine Foundation (Backend Milestone 14.1). Depends on
 * AuthorizationModule for `PermissionGuard` (`layout.manage`) — used by
 * `LayoutsController`/`LayoutAssignmentsController`; `PublicLayoutsController`
 * is `@Public()` and never touches it. Imports `PagesModule`/`ArticlesModule`/
 * `CategoriesModule` to reuse their exported `PublicPagesService`/
 * `PublicArticlesService`/`PublicCategoriesService` for slug -> id
 * resolution — the exact same composition `SeoModule` already establishes
 * for `PublicSeoController`. PrismaService is injected via the
 * already-@Global() DatabaseModule. See docs/78_LAYOUT_ENGINE.md.
 */
@Module({
  imports: [AuthorizationModule, PagesModule, ArticlesModule, CategoriesModule],
  controllers: [LayoutsController, LayoutAssignmentsController, PublicLayoutsController],
  providers: [
    LayoutsRepository,
    LayoutAssignmentsRepository,
    LayoutsValidator,
    LayoutAssignmentsValidator,
    LayoutsMapper,
    LayoutAssignmentsMapper,
    LayoutsService,
    LayoutAssignmentsService,
    PublicLayoutsService,
  ],
  exports: [LayoutsService, LayoutAssignmentsService],
})
export class LayoutsModule {}
