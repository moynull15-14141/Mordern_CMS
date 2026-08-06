import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ReusableBlocksController } from './controllers/reusable-blocks.controller';
import { PublicContentBlocksController } from './controllers/public-content-blocks.controller';
import { ReusableBlockRepository } from './repositories/reusable-block.repository';
import { ReusableBlockMapper } from './mappers/reusable-block.mapper';
import { BlockTreeValidator } from './validators/block-tree.validator';
import { ReusableBlockCycleValidator } from './validators/reusable-block-cycle.validator';
import { BlockTreeSanitizer } from './sanitization/block-tree-sanitizer.service';
import { ReusableBlocksService } from './services/reusable-blocks.service';
import { PublicContentBlocksService } from './services/public-content-blocks.service';

/**
 * Rich Content Engine — Phase 1 / Step 1. Depends on `AuthorizationModule`
 * for `PermissionGuard` (reuses `page.manage`, see
 * `ReusableBlocksController`'s doc comment) — used only by
 * `ReusableBlocksController`; `PublicContentBlocksController` is
 * `@Public()` and never touches it. PrismaService is injected via the
 * already-`@Global()` DatabaseModule.
 *
 * `BlockTreeValidator`/`BlockTreeSanitizer` are exported so
 * `ArticlesModule`/`PagesModule` can import this module and inject them
 * into `ArticlesService`/`PagesService` to validate + sanitize `body`
 * before every create/update — the same composition shape `LayoutsModule`
 * already establishes by importing `PagesModule`/`ArticlesModule`/
 * `CategoriesModule` to reuse their exported public services.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [ReusableBlocksController, PublicContentBlocksController],
  providers: [
    ReusableBlockRepository,
    ReusableBlockMapper,
    BlockTreeValidator,
    ReusableBlockCycleValidator,
    BlockTreeSanitizer,
    ReusableBlocksService,
    PublicContentBlocksService,
  ],
  exports: [BlockTreeValidator, BlockTreeSanitizer, ReusableBlocksService],
})
export class ContentBlocksModule {}
