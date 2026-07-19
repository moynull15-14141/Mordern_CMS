import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { PublicCategoriesService } from '../services/public-categories.service';
import { PublicCategoryQueryDto } from '../dto/public-category-query.dto';
import { PublicCategoryResponseDto } from '../dto/public-category-response.dto';

/**
 * Public Categories API (Backend Milestone 13.2). Deliberately a separate
 * controller from `CategoriesController`, not `@Public()` routes added to
 * it — same reasoning `PublicPagesController`'s doc comment gives:
 * `CategoriesController` carries a class-level
 * `@UseGuards(PermissionGuard)` + `@RequirePermission(PERMISSIONS.CATEGORY_CREATE)`,
 * so a route inside it can never truly be public.
 */
@ApiTags('Public Categories')
@Public()
@Controller('public/categories')
export class PublicCategoriesController {
  constructor(private readonly publicCategoriesService: PublicCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List active categories (paginated) — public, no auth' })
  @ApiWrappedResponse(PublicCategoryResponseDto, { isArray: true })
  async listCategories(
    @Query() query: PublicCategoryQueryDto
  ): Promise<PaginatedResult<PublicCategoryResponseDto>> {
    return this.publicCategoriesService.listCategories(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get an active category by slug — public, no auth' })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(PublicCategoryResponseDto)
  async getCategoryBySlug(@Param('slug') slug: string): Promise<PublicCategoryResponseDto> {
    return this.publicCategoriesService.getCategoryBySlug(slug);
  }
}
