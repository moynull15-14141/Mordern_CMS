import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SettingsModule } from '../settings/settings.module';
import { PagesModule } from '../pages/pages.module';
import { ArticlesModule } from '../articles/articles.module';
import { CategoriesModule } from '../categories/categories.module';
import { SeoController } from './controllers/seo.controller';
import { PublicSeoController } from './controllers/public-seo.controller';
import { SeoRepository } from './repositories/seo.repository';
import { SeoValidator } from './validators/seo.validator';
import { SeoMapper } from './mappers/seo.mapper';
import { PublicSeoMapper } from './mappers/public-seo.mapper';
import { SeoService } from './services/seo.service';
import { PublicSeoService } from './services/public-seo.service';

/**
 * SEO & Metadata Engine Foundation (Milestone 12). Backend foundation
 * only — no frontend, no crawler, no search engine, no analytics, no
 * Google integration. Depends on AuthorizationModule for `PermissionGuard`
 * (`seo.manage` — reused for every endpoint, see
 * docs/51_SEO_ARCHITECTURE.md "Permission Flow") and SettingsModule
 * (reuses `SettingCategory.SEO`'s `defaultMetaTitle`/`defaultMetaDescription`
 * for preview fallback, instead of hardcoding). PrismaService is injected
 * via the already-@Global() DatabaseModule.
 *
 * `PublicSeoController` (Milestone 13.2,
 * docs/75_BACKEND_PUBLIC_CONTENT_API.md) additionally imports
 * `PagesModule`/`ArticlesModule`/`CategoriesModule` to reuse their exported
 * `PublicPagesService`/`PublicArticlesService`/`PublicCategoriesService`
 * for slug -> id resolution (each already enforces its own
 * published/active/public-visibility gate) — no new gate logic, no new
 * repository query.
 */
@Module({
  imports: [AuthorizationModule, SettingsModule, PagesModule, ArticlesModule, CategoriesModule],
  controllers: [SeoController, PublicSeoController],
  providers: [
    SeoRepository,
    SeoValidator,
    SeoMapper,
    PublicSeoMapper,
    SeoService,
    PublicSeoService,
  ],
  exports: [SeoService],
})
export class SeoModule {}
