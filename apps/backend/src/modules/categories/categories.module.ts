import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { CategoriesController } from './controllers/categories.controller';
import { TagsController } from './controllers/tags.controller';
import { PublicCategoriesController } from './controllers/public-categories.controller';
import { CategoriesRepository } from './repositories/categories.repository';
import { TagsRepository } from './repositories/tags.repository';
import { SlugShapeValidator } from './validators/slug-shape.validator';
import { CategoriesMapper } from './mappers/categories.mapper';
import { TagsMapper } from './mappers/tags.mapper';
import { PublicCategoriesMapper } from './mappers/public-categories.mapper';
import { CategoriesService } from './services/categories.service';
import { TagsService } from './services/tags.service';
import { PublicCategoriesService } from './services/public-categories.service';

/**
 * Category & Tag Foundation (Milestone 9). Backend foundation only — no
 * Frontend/Admin UI/Media Library/Comments/Widgets/Menu/Page/Theme Builder.
 * Depends on AuthorizationModule for `PermissionGuard`
 * (`category.create` — reused for every endpoint, see
 * docs/47_CATEGORY_TAG_ARCHITECTURE.md "Permission Flow") and
 * `AuthorizationService` (role resolution for `TaxonomyPolicy`).
 * PrismaService is injected via the already-@Global() DatabaseModule.
 * `PublicCategoriesController` (Milestone 13.2,
 * docs/75_BACKEND_PUBLIC_CONTENT_API.md) is `@Public()` and never touches
 * `PermissionGuard`. `PublicCategoriesService` is exported for
 * `SeoModule`'s `GET /public/seo/category/:slug` composition.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [CategoriesController, TagsController, PublicCategoriesController],
  providers: [
    CategoriesRepository,
    TagsRepository,
    SlugShapeValidator,
    CategoriesMapper,
    TagsMapper,
    PublicCategoriesMapper,
    CategoriesService,
    TagsService,
    PublicCategoriesService,
  ],
  exports: [CategoriesService, TagsService, PublicCategoriesService],
})
export class CategoriesModule {}
