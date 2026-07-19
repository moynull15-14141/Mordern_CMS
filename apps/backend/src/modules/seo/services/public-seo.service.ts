import { BadRequestException, Injectable } from '@nestjs/common';
import { SeoService } from './seo.service';
import { PublicSeoMapper } from '../mappers/public-seo.mapper';
import { PublicSeoResponseDto } from '../dto/public-seo-response.dto';
import { PublicSeoEntityType } from '../constants/public-seo-entity-type';
import { PublicPagesService } from '../../pages/services/public-pages.service';
import { PublicArticlesService } from '../../articles/services/public-articles.service';
import { PublicCategoriesService } from '../../categories/services/public-categories.service';

/**
 * Public SEO composition endpoint (Milestone 13.2) — built because
 * `SeoService` already supports it (`getSeoForPage`/`getSeoForArticle`/
 * `getSeoForCategory` all exist and are reused verbatim below); per the
 * milestone brief, "otherwise do not invent" would have applied, but that
 * escape hatch isn't needed here.
 *
 * Resolves `slug -> id` via the matching `Public*Service.resolvePublishedIdBySlug()`
 * (Pages/Articles/Categories) — reusing the exact same published/active/
 * public-visibility gate those services already enforce for their own
 * entity endpoints, never re-implementing it. A slug that doesn't resolve
 * (not found, or exists but isn't published/active/public) throws the
 * same `PageNotFoundException`/`ArticleNotFoundException`/
 * `CategoryNotFoundException` those services already throw — this service
 * adds no new "not found" behavior of its own for that case.
 */
@Injectable()
export class PublicSeoService {
  constructor(
    private readonly seoService: SeoService,
    private readonly publicPagesService: PublicPagesService,
    private readonly publicArticlesService: PublicArticlesService,
    private readonly publicCategoriesService: PublicCategoriesService,
    private readonly mapper: PublicSeoMapper
  ) {}

  async getSeoForEntity(entity: PublicSeoEntityType, slug: string): Promise<PublicSeoResponseDto> {
    switch (entity) {
      case 'page': {
        const id = await this.publicPagesService.resolvePublishedIdBySlug(slug);
        return this.mapper.toPublicResponseDto(await this.seoService.getSeoForPage(id));
      }
      case 'article': {
        const id = await this.publicArticlesService.resolvePublishedIdBySlug(slug);
        return this.mapper.toPublicResponseDto(await this.seoService.getSeoForArticle(id));
      }
      case 'category': {
        const id = await this.publicCategoriesService.resolvePublishedIdBySlug(slug);
        return this.mapper.toPublicResponseDto(await this.seoService.getSeoForCategory(id));
      }
      default: {
        const exhaustiveCheck: never = entity;
        throw new BadRequestException(`Unsupported SEO entity type: ${String(exhaustiveCheck)}`);
      }
    }
  }
}
