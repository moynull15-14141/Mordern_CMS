import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ContentBlocksModule } from '../content-blocks/content-blocks.module';
import { ArticlesController } from './controllers/articles.controller';
import { PublicArticlesController } from './controllers/public-articles.controller';
import { ArticlesRepository } from './repositories/articles.repository';
import { ArticlesValidator } from './validators/articles.validator';
import { ArticlesMapper } from './mappers/articles.mapper';
import { PublicArticlesMapper } from './mappers/public-articles.mapper';
import { ArticlesService } from './services/articles.service';
import { PublicArticlesService } from './services/public-articles.service';

/**
 * Content / Articles Foundation (Milestone 8). Backend foundation only — no
 * Media/Comments/Search/AI/Public UI. Depends on AuthorizationModule for
 * `PermissionGuard` (`article.create`/`update`/`delete`/`publish`) and
 * `AuthorizationService` (role resolution for `ArticleOwnershipPolicy`).
 * PrismaService is injected via the already-@Global() DatabaseModule.
 * `PublicArticlesController` (Milestone 13.2,
 * docs/75_BACKEND_PUBLIC_CONTENT_API.md) is `@Public()` and never touches
 * `PermissionGuard`. `PublicArticlesService` is exported for `SeoModule`'s
 * `GET /public/seo/article/:slug` composition. Imports `ContentBlocksModule`
 * (Rich Content Engine, Phase 1 / Step 1) to inject `BlockTreeValidator`
 * into `ArticlesService`, validating `body`'s block-tree shape before
 * every create/update.
 */
@Module({
  imports: [AuthorizationModule, ContentBlocksModule],
  controllers: [ArticlesController, PublicArticlesController],
  providers: [
    ArticlesRepository,
    ArticlesValidator,
    ArticlesMapper,
    PublicArticlesMapper,
    ArticlesService,
    PublicArticlesService,
  ],
  exports: [ArticlesService, PublicArticlesService],
})
export class ArticlesModule {}
