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
import { RequireAnyPermission } from '../../authorization/decorators/require-any-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { MediaFolderService } from '../services/media-folder.service';
import { CreateMediaFolderDto } from '../dto/create-media-folder.dto';
import { UpdateMediaFolderDto } from '../dto/update-media-folder.dto';
import { MoveMediaFolderDto } from '../dto/move-media-folder.dto';
import { MediaFolderQueryDto } from '../dto/media-folder-query.dto';
import {
  MediaFolderBreadcrumbItemDto,
  MediaFolderResponseDto,
  MediaFolderTreeNodeResponseDto,
} from '../dto/media-folder-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

const ANY_MEDIA_PERMISSION = [PERMISSIONS.MEDIA_UPLOAD, PERMISSIONS.MEDIA_DELETE];

/** Same permission-reuse reasoning as MediaController — no folder-specific
 * permission exists either. */
@ApiTags('Media Folders')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('media-folders')
export class MediaFolderController {
  constructor(private readonly mediaFolderService: MediaFolderService) {}

  @Get()
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'List/search/sort media folders (paginated)' })
  @ApiWrappedResponse(MediaFolderResponseDto, { isArray: true })
  async listFolders(
    @Query() query: MediaFolderQueryDto
  ): Promise<PaginatedResult<MediaFolderResponseDto>> {
    return this.mediaFolderService.listFolders({
      filters: { parentId: query.parentId, search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get('tree')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Get the full media folder tree (unlimited nesting)' })
  @ApiWrappedResponse(MediaFolderTreeNodeResponseDto, { isArray: true })
  async getTree(): Promise<MediaFolderTreeNodeResponseDto[]> {
    return this.mediaFolderService.getTree();
  }

  @Get(':id')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Get a media folder by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaFolderResponseDto)
  async getFolder(@Param('id') id: string): Promise<MediaFolderResponseDto> {
    return this.mediaFolderService.getFolder(id);
  }

  @Get(':id/children')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Get direct children of a folder' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaFolderResponseDto, { isArray: true })
  async getChildren(@Param('id') id: string): Promise<MediaFolderResponseDto[]> {
    return this.mediaFolderService.getChildren(id);
  }

  @Get(':id/descendants')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Get every descendant of a folder (all levels)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaFolderResponseDto, { isArray: true })
  async getDescendants(@Param('id') id: string): Promise<MediaFolderResponseDto[]> {
    return this.mediaFolderService.getDescendants(id);
  }

  @Get(':id/ancestors')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Get every ancestor of a folder, root-first' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaFolderResponseDto, { isArray: true })
  async getAncestors(@Param('id') id: string): Promise<MediaFolderResponseDto[]> {
    return this.mediaFolderService.getAncestors(id);
  }

  @Get(':id/breadcrumb')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Get the breadcrumb path (root to self)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaFolderBreadcrumbItemDto, { isArray: true })
  async getBreadcrumb(@Param('id') id: string): Promise<MediaFolderBreadcrumbItemDto[]> {
    return this.mediaFolderService.getBreadcrumb(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Create a media folder' })
  @ApiWrappedResponse(MediaFolderResponseDto)
  async createFolder(
    @Body() dto: CreateMediaFolderDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaFolderResponseDto> {
    return this.mediaFolderService.createFolder(dto, { id: user.id });
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Update a media folder (parent changes use POST /:id/move instead)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaFolderResponseDto)
  async updateFolder(
    @Param('id') id: string,
    @Body() dto: UpdateMediaFolderDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaFolderResponseDto> {
    return this.mediaFolderService.updateFolder(id, dto, { id: user.id });
  }

  @Post(':id/move')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: "Change a folder's parent (circular-reference safe)" })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaFolderResponseDto)
  async moveFolder(
    @Param('id') id: string,
    @Body() dto: MoveMediaFolderDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaFolderResponseDto> {
    return this.mediaFolderService.moveFolder(id, dto, { id: user.id });
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.MEDIA_DELETE)
  @ApiOperation({
    summary: 'Soft-delete a folder (rejected if it still contains assets or has active children)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaFolderResponseDto)
  async deleteFolder(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaFolderResponseDto> {
    return this.mediaFolderService.deleteFolder(id, { id: user.id });
  }

  @Post(':id/restore')
  @RequirePermission(PERMISSIONS.MEDIA_DELETE)
  @ApiOperation({
    summary:
      'Restore a soft-deleted folder (reuses media.delete — no media.restore permission exists)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaFolderResponseDto)
  async restoreFolder(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaFolderResponseDto> {
    return this.mediaFolderService.restoreFolder(id, { id: user.id });
  }
}
