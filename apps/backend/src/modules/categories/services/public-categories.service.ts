import { Injectable } from '@nestjs/common';
import { CategoryStatus } from '@prisma/client';
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { CategoriesService } from './categories.service';
import { PublicCategoriesMapper } from '../mappers/public-categories.mapper';
import { PublicCategoryQueryDto } from '../dto/public-category-query.dto';
import { PublicCategoryResponseDto } from '../dto/public-category-response.dto';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { CategoryNotFoundException } from '../exceptions/category.exceptions';

/**
 * Public read path (Milestone 13.2) — delegates entirely to the existing,
 * already-tested `CategoriesService` for the actual query and N+1-safe
 * count batching (`listCategories`/`getCategoryBySlug`); this service adds
 * only an ACTIVE-only gate and a trim to the public DTO shape. Mirrors
 * `PublicPagesService`'s exact reasoning for being a separate injectable.
 *
 * An INACTIVE category that matches the slug is treated exactly like "no
 * category with this slug exists" — same `CategoryNotFoundException`,
 * never a different error.
 */
@Injectable()
export class PublicCategoriesService {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly mapper: PublicCategoriesMapper
  ) {}

  async listCategories(
    query: PublicCategoryQueryDto
  ): Promise<PaginatedResult<PublicCategoryResponseDto>> {
    const result = await this.categoriesService.listCategories({
      filters: { status: CategoryStatus.ACTIVE, search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });

    return {
      items: result.items.map((item) => this.mapper.toPublicResponseDto(item)),
      pagination: result.pagination,
    };
  }

  private async getActiveOrThrow(slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.getCategoryBySlug(slug);
    if (category.status !== CategoryStatus.ACTIVE) {
      throw new CategoryNotFoundException(slug);
    }
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<PublicCategoryResponseDto> {
    const category = await this.getActiveOrThrow(slug);
    return this.mapper.toPublicResponseDto(category);
  }

  /** Slug -> id resolution for `SeoModule`'s
   * `GET /public/seo/category/:slug` composition — see
   * `PublicPagesService.resolvePublishedIdBySlug`'s doc comment for the
   * exact same reasoning. */
  async resolvePublishedIdBySlug(slug: string): Promise<string> {
    const category = await this.getActiveOrThrow(slug);
    return category.id;
  }
}
