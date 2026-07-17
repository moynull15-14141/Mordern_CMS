import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { CategoriesController } from './controllers/categories.controller';
import { TagsController } from './controllers/tags.controller';
import { CategoriesRepository } from './repositories/categories.repository';
import { TagsRepository } from './repositories/tags.repository';
import { SlugShapeValidator } from './validators/slug-shape.validator';
import { CategoriesMapper } from './mappers/categories.mapper';
import { TagsMapper } from './mappers/tags.mapper';
import { CategoriesService } from './services/categories.service';
import { TagsService } from './services/tags.service';

/**
 * Category & Tag Foundation (Milestone 9). Backend foundation only — no
 * Frontend/Admin UI/Media Library/Comments/Widgets/Menu/Page/Theme Builder.
 * Depends on AuthorizationModule for `PermissionGuard`
 * (`category.create` — reused for every endpoint, see
 * docs/47_CATEGORY_TAG_ARCHITECTURE.md "Permission Flow") and
 * `AuthorizationService` (role resolution for `TaxonomyPolicy`).
 * PrismaService is injected via the already-@Global() DatabaseModule.
 */
@Module({
  imports: [AuthorizationModule],
  controllers: [CategoriesController, TagsController],
  providers: [
    CategoriesRepository,
    TagsRepository,
    SlugShapeValidator,
    CategoriesMapper,
    TagsMapper,
    CategoriesService,
    TagsService,
  ],
  exports: [CategoriesService, TagsService],
})
export class CategoriesModule {}
