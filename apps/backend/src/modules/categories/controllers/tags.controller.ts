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
import { TagsService } from '../services/tags.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { TagQueryDto } from '../dto/tag-query.dto';
import { TagResponseDto } from '../dto/tag-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/** No `tag.*` permission exists at all (frozen vocabulary) — every endpoint
 * reuses `category.create`, same reasoning as CategoriesController. See
 * docs/47_CATEGORY_TAG_ARCHITECTURE.md "Permission Flow". */
@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.CATEGORY_CREATE)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List/search/sort tags (paginated)' })
  @ApiWrappedResponse(TagResponseDto, { isArray: true })
  async listTags(@Query() query: TagQueryDto): Promise<PaginatedResult<TagResponseDto>> {
    return this.tagsService.listTags({
      filters: { search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a tag by slug' })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(TagResponseDto)
  async getTagBySlug(@Param('slug') slug: string): Promise<TagResponseDto> {
    return this.tagsService.getTagBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tag by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(TagResponseDto)
  async getTag(@Param('id') id: string): Promise<TagResponseDto> {
    return this.tagsService.getTag(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  @ApiWrappedResponse(TagResponseDto)
  async createTag(
    @Body() dto: CreateTagDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<TagResponseDto> {
    return this.tagsService.createTag(dto, { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(TagResponseDto)
  async updateTag(
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<TagResponseDto> {
    return this.tagsService.updateTag(id, dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a tag (rejected if still used by articles)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(TagResponseDto)
  async deleteTag(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<TagResponseDto> {
    return this.tagsService.deleteTag(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({
    summary:
      'Restore a soft-deleted tag (reuses category.create — no tag.restore permission exists)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(TagResponseDto)
  async restoreTag(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<TagResponseDto> {
    return this.tagsService.restoreTag(id, { id: user.id });
  }
}
