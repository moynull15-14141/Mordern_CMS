import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SettingsModule } from '../settings/settings.module';
import { SeoController } from './controllers/seo.controller';
import { SeoRepository } from './repositories/seo.repository';
import { SeoValidator } from './validators/seo.validator';
import { SeoMapper } from './mappers/seo.mapper';
import { SeoService } from './services/seo.service';

/**
 * SEO & Metadata Engine Foundation (Milestone 12). Backend foundation
 * only — no frontend, no crawler, no search engine, no analytics, no
 * Google integration. Depends on AuthorizationModule for `PermissionGuard`
 * (`seo.manage` — reused for every endpoint, see
 * docs/51_SEO_ARCHITECTURE.md "Permission Flow") and SettingsModule
 * (reuses `SettingCategory.SEO`'s `defaultMetaTitle`/`defaultMetaDescription`
 * for preview fallback, instead of hardcoding). PrismaService is injected
 * via the already-@Global() DatabaseModule.
 */
@Module({
  imports: [AuthorizationModule, SettingsModule],
  controllers: [SeoController],
  providers: [SeoRepository, SeoValidator, SeoMapper, SeoService],
  exports: [SeoService],
})
export class SeoModule {}
