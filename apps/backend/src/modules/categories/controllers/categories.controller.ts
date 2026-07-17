import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { RequirePermission } from '../../authorization/decorators/require-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { MoveCategoryDto } from '../dto/move-category.dto';
import { CategoryQueryDto } from '../dto/category-query.dto';
import {
  CategoryBreadcrumbItemDto,
  CategoryResponseDto,
  CategoryTreeNodeResponseDto,
} from '../dto/category-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * Category & Tag Foundation (Milestone 9). No `category.view`/
 * `category.restore` permission exists (frozen vocabulary) — every endpoint
 * here (read and write) is gated by the single existing `category.create`
 * permission, the same "one coarse permission covers the whole resource"
 * pattern Settings established in Milestone 6. See
 * docs/47_CATEGORY_TAG_ARCHITECTURE.md "Permission Flow".
 */
@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.CATEGORY_CREATE)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List/search/filter/sort categories (paginated)' })
  @ApiWrappedResponse(CategoryResponseDto, { isArray: true })
  async listCategories(
    @Query() query: CategoryQueryDto
  ): Promise<PaginatedResult<CategoryResponseDto>> {
    return this.categoriesService.listCategories({
      filters: { status: query.status, parentId: query.parentId, search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get the full category tree (unlimited nesting)' })
  @ApiWrappedResponse(CategoryTreeNodeResponseDto, { isArray: true })
  async getTree(): Promise<CategoryTreeNodeResponseDto[]> {
    return this.categoriesService.getTree();
  }

  @Get('flat')
  @ApiOperation({ summary: 'Get every category as a flat list (with resolved counts/SEO)' })
  @ApiWrappedResponse(CategoryResponseDto, { isArray: true })
  async getFlat(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getFlat();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a category by slug' })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(CategoryResponseDto)
  async getCategoryBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return this.categoriesService.getCategoryBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CategoryResponseDto)
  async getCategory(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.getCategory(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get direct children of a category' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CategoryResponseDto, { isArray: true })
  async getChildren(@Param('id') id: string): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getChildren(id);
  }

  @Get(':id/descendants')
  @ApiOperation({ summary: 'Get every descendant of a category (all levels)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CategoryResponseDto, { isArray: true })
  async getDescendants(@Param('id') id: string): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getDescendants(id);
  }

  @Get(':id/ancestors')
  @ApiOperation({ summary: 'Get every ancestor of a category, root-first' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CategoryResponseDto, { isArray: true })
  async getAncestors(@Param('id') id: string): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getAncestors(id);
  }

  @Get(':id/breadcrumb')
  @ApiOperation({ summary: 'Get the breadcrumb path (root to self)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CategoryBreadcrumbItemDto, { isArray: true })
  async getBreadcrumb(@Param('id') id: string): Promise<CategoryBreadcrumbItemDto[]> {
    return this.categoriesService.getBreadcrumb(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @ApiWrappedResponse(CategoryResponseDto)
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.createCategory(dto, { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category (parent changes use POST /:id/move instead)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CategoryResponseDto)
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.updateCategory(id, dto, { id: user.id });
  }

  @Post(':id/move')
  @ApiOperation({ summary: "Change a category's parent (circular-reference safe)" })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CategoryResponseDto)
  async moveCategory(
    @Param('id') id: string,
    @Body() dto: MoveCategoryDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.moveCategory(id, dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft-delete a category (rejected if still used by articles or has active children)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CategoryResponseDto)
  async deleteCategory(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.deleteCategory(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({
    summary:
      'Restore a soft-deleted category (reuses category.create — no category.restore permission exists)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(CategoryResponseDto)
  async restoreCategory(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.restoreCategory(id, { id: user.id });
  }
}
