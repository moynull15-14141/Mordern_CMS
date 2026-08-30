import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { PagesService } from './pages.service';
import { PagePreviewService } from './page-preview.service';
import { PublicPagesMapper } from '../mappers/public-pages.mapper';
import { PublicPageListItemDto, PublicPageResponseDto } from '../dto/public-page-response.dto';
import { PublicPageQueryDto } from '../dto/public-page-query.dto';
import { PageResponseDto } from '../dto/page-response.dto';
import { PageNotFoundException } from '../exceptions/page.exceptions';

/**
 * Public read path (Milestone 13.2) — delegates entirely to the existing,
 * already-tested `PagesService` for the actual query (same
 * `getDefaultSite()` + `findBySlugWithRelations()` a real caller would get);
 * this service adds nothing beyond a published-only gate and a trim to the
 * public DTO shape. Deliberately a separate injectable from `PagesService`,
 * mirroring `PublicMenusService`/`PublicThemesService`'s own reasoning: no
 * writes happen here, and isolating it gives a future caching layer one
 * narrow class to wrap without touching admin CRUD.
 *
 * A DRAFT/REVIEW/ARCHIVED page that matches the slug is treated exactly
 * like "no page with this slug exists" — `PageNotFoundException` again,
 * never a different error — so a public caller can never distinguish
 * "doesn't exist" from "exists but isn't published yet".
 */
@Injectable()
export class PublicPagesService {
  constructor(
    private readonly pagesService: PagesService,
    private readonly mapper: PublicPagesMapper,
    private readonly pagePreviewService: PagePreviewService
  ) {}

  /** Powers `GET /public/pages` — primarily so `apps/web`'s sitemap
   * generator can enumerate every published page (no other public
   * endpoint could, until now — see the Step 2 URL/SEO milestone's Phase
   * 0 audit). Reuses `PagesService.listPages` verbatim, forcing
   * `status: PUBLISHED` server-side exactly like `PublicArticlesService`. */
  async listPages(query: PublicPageQueryDto): Promise<PaginatedResult<PublicPageListItemDto>> {
    const result = await this.pagesService.listPages({
      filters: { status: ContentStatus.PUBLISHED, search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });

    return {
      items: result.items.map((item) => this.mapper.toListItemDto(item)),
      pagination: result.pagination,
    };
  }

  private async getPublishedOrThrow(slug: string): Promise<PageResponseDto> {
    const page = await this.pagesService.getPageBySlug(slug);
    if (page.status !== ContentStatus.PUBLISHED) {
      throw new PageNotFoundException(slug);
    }
    return page;
  }

  async getPageBySlug(slug: string): Promise<PublicPageResponseDto> {
    const page = await this.getPublishedOrThrow(slug);
    return this.mapper.toPublicResponseDto(page);
  }

  /** Slug -> id resolution for `SeoModule`'s `GET /public/seo/page/:slug`
   * composition — reuses the exact same published-only gate as
   * `getPageBySlug` (via `getPublishedOrThrow`) rather than duplicating it,
   * returning just the `id` `SeoService.getSeoForPage()` needs (the public
   * DTO itself deliberately never exposes `id` — see
   * `PublicPageResponseDto`'s doc comment). */
  async resolvePublishedIdBySlug(slug: string): Promise<string> {
    const page = await this.getPublishedOrThrow(slug);
    return page.id;
  }

  /** No status gate — unlike every other method here, a preview token is
   * itself the authorization (short-lived, minted only from the
   * admin-authenticated `POST /pages/:id/preview-token`), so a DRAFT/
   * REVIEW page resolves normally instead of 404ing. */
  async getPageForPreview(token: string): Promise<PublicPageResponseDto> {
    const pageId = this.pagePreviewService.resolvePreviewToken(token);
    const page = await this.pagesService.getPage(pageId);
    return this.mapper.toPublicResponseDto(page);
  }
}
