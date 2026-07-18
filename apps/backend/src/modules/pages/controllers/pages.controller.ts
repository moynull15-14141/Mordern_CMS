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
import { PagesService } from '../services/pages.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { PageQueryDto } from '../dto/page-query.dto';
import { PageResponseDto } from '../dto/page-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * Pages Foundation. Every endpoint requires the single frozen
 * `page.manage` permission (`38_RBAC_ARCHITECTURE.md`) — no ownership
 * split like Articles (no `authorId` on `Page`), no separate view/publish
 * permissions to invent. Mirrors `SettingsController`'s single-permission,
 * class-level-guard style. See docs/69_BACKEND_PAGES.md.
 */
@ApiTags('Pages')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.PAGE_MANAGE)
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'List/search/filter/sort pages (paginated)' })
  @ApiWrappedResponse(PageResponseDto, { isArray: true })
  async listPages(@Query() query: PageQueryDto): Promise<PaginatedResult<PageResponseDto>> {
    return this.pagesService.listPages({
      filters: { status: query.status, search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a page by slug' })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(PageResponseDto)
  async getPageBySlug(@Param('slug') slug: string): Promise<PageResponseDto> {
    return this.pagesService.getPageBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a page by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PageResponseDto)
  async getPage(@Param('id') id: string): Promise<PageResponseDto> {
    return this.pagesService.getPage(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a page' })
  @ApiWrappedResponse(PageResponseDto)
  async createPage(
    @Body() dto: CreatePageDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PageResponseDto> {
    return this.pagesService.createPage(dto, { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a page (status limited to DRAFT/REVIEW/ARCHIVED)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PageResponseDto)
  async updatePage(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PageResponseDto> {
    return this.pagesService.updatePage(id, dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a page' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PageResponseDto)
  async deletePage(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PageResponseDto> {
    return this.pagesService.deletePage(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted page' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PageResponseDto)
  async restorePage(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PageResponseDto> {
    return this.pagesService.restorePage(id, { id: user.id });
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a page immediately' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PageResponseDto)
  async publishPage(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PageResponseDto> {
    return this.pagesService.publishPage(id, { id: user.id });
  }
}
