import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ContentBlocksModule } from '../content-blocks/content-blocks.module';
import { SlugShapeValidator } from '../categories/validators/slug-shape.validator';
import { PatternsController } from './controllers/patterns.controller';
import { PatternFavoritesController } from './controllers/pattern-favorites.controller';
import { PublicPatternsController } from './controllers/public-patterns.controller';
import { PatternRepository } from './repositories/pattern.repository';
import { PatternFavoriteRepository } from './repositories/pattern-favorite.repository';
import { PatternMapper } from './mappers/pattern.mapper';
import { PatternsService } from './services/patterns.service';
import { PatternFavoritesService } from './services/pattern-favorites.service';
import { PublicPatternsService } from './services/public-patterns.service';

/**
 * Section & Pattern Library (Milestone 6) — reusable, multi-block
 * compositions built entirely on the existing Block Engine. Depends on
 * `ContentBlocksModule` for `BlockTreeValidator`/`BlockTreeSanitizer`
 * (identical `{blocks: BlockNode[]}` shape validation Page/Article already
 * use). `SlugShapeValidator` is re-provided directly from the Categories
 * module (not imported via `CategoriesModule`, which doesn't export it) —
 * the exact same "re-provide the stateless class, don't import the whole
 * module" technique `MediaModule` already established for folder slugs.
 * Depends on `AuthorizationModule` for `PermissionGuard` (`page.manage`,
 * reused — see `PatternsController`'s doc comment). PrismaService is
 * injected via the already-@Global() DatabaseModule. `PatternRepository`
 * reaches `prisma.mediaAsset`/`prisma.page`/`prisma.article`/
 * `prisma.reusableBlock` directly (bypassing those modules) to avoid
 * circular dependencies — same established pattern
 * `ReusableBlockRepository`/`MediaRepository` already use.
 */
@Module({
  imports: [AuthorizationModule, ContentBlocksModule],
  controllers: [PatternsController, PatternFavoritesController, PublicPatternsController],
  providers: [
    PatternRepository,
    PatternFavoriteRepository,
    SlugShapeValidator,
    PatternMapper,
    PatternsService,
    PatternFavoritesService,
    PublicPatternsService,
  ],
  exports: [PatternsService],
})
export class PatternsModule {}
