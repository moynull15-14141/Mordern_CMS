import { Injectable } from '@nestjs/common';
import { ArticleVisibility, ContentStatus } from '@prisma/client';
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { ArticlesService } from './articles.service';
import { PublicArticlesMapper } from '../mappers/public-articles.mapper';
import { PublicArticleQueryDto } from '../dto/public-article-query.dto';
import {
  PublicArticleListItemDto,
  PublicArticleResponseDto,
} from '../dto/public-article-response.dto';
import { ArticleResponseDto } from '../dto/article-response.dto';
import { ArticleNotFoundException } from '../exceptions/article.exceptions';

/**
 * Public read path (Milestone 13.2) — delegates entirely to the existing,
 * already-tested `ArticlesService` for the actual query (reuses its full
 * search/filter/pagination logic verbatim); this service adds only a
 * published-visibility gate and a trim to the public DTO shapes. Mirrors
 * `PublicPagesService`'s exact reasoning for being a separate injectable.
 *
 * Visibility rule (not explicitly specified by the milestone brief, decided
 * here — see docs/75_BACKEND_PUBLIC_CONTENT_API.md "Security Model"):
 * - Listing (`listArticles`) — `PUBLIC` only. `UNLISTED` articles are, by
 *   definition, reachable only via direct link, never a listing.
 * - Single-article lookup (`getArticleBySlug`) — `PUBLIC` or `UNLISTED`.
 *   `PRIVATE` is never returned regardless of how it's reached.
 * Both always additionally require `status: PUBLISHED`. A non-matching
 * article is treated exactly like "no article with this slug exists" —
 * `ArticleNotFoundException`, never a different error.
 */
@Injectable()
export class PublicArticlesService {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly mapper: PublicArticlesMapper
  ) {}

  async listArticles(
    query: PublicArticleQueryDto
  ): Promise<PaginatedResult<PublicArticleListItemDto>> {
    const result = await this.articlesService.listArticles({
      filters: {
        status: ContentStatus.PUBLISHED,
        visibility: ArticleVisibility.PUBLIC,
        search: query.search,
      },
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

  private async getPublicOrThrow(slug: string): Promise<ArticleResponseDto> {
    const article = await this.articlesService.getArticleBySlug(slug);
    const isPublished = article.status === ContentStatus.PUBLISHED;
    const isPubliclyVisible = article.visibility !== ArticleVisibility.PRIVATE;
    if (!isPublished || !isPubliclyVisible) {
      throw new ArticleNotFoundException(slug);
    }
    return article;
  }

  async getArticleBySlug(slug: string): Promise<PublicArticleResponseDto> {
    const article = await this.getPublicOrThrow(slug);
    return this.mapper.toPublicResponseDto(article);
  }

  /** Slug -> id resolution for `SeoModule`'s `GET /public/seo/article/:slug`
   * composition — see `PublicPagesService.resolvePublishedIdBySlug`'s doc
   * comment for the exact same reasoning. */
  async resolvePublishedIdBySlug(slug: string): Promise<string> {
    const article = await this.getPublicOrThrow(slug);
    return article.id;
  }
}
