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
import { MediaService } from '../services/media.service';
import { CreateMediaAssetDto } from '../dto/create-media-asset.dto';
import { UpdateMediaAssetDto } from '../dto/update-media-asset.dto';
import { RenameMediaAssetDto } from '../dto/rename-media-asset.dto';
import { MoveMediaAssetDto } from '../dto/move-media-asset.dto';
import { CopyMediaMetadataDto } from '../dto/copy-media-metadata.dto';
import { MediaQueryDto } from '../dto/media-query.dto';
import { MediaResponseDto } from '../dto/media-response.dto';
import { MediaUsageReferenceDto } from '../dto/media-usage.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

const ANY_MEDIA_PERMISSION = [PERMISSIONS.MEDIA_UPLOAD, PERMISSIONS.MEDIA_DELETE];

/**
 * Media Library Foundation (Milestone 10). No `media.view`/`media.restore`
 * permission exists (frozen vocabulary) — reads use the existing
 * `RequireAnyPermission` OR-mechanism across the two real media permissions;
 * restore reuses `media.delete`. Writes additionally enforce ownership via
 * `MediaOwnershipPolicy` inside the service (Owner/Editor/Administrator/
 * Super Admin) — see docs/48_MEDIA_LIBRARY_ARCHITECTURE.md "Permission Flow".
 */
@ApiTags('Media')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'List/search/filter/sort media assets (paginated)' })
  @ApiWrappedResponse(MediaResponseDto, { isArray: true })
  async listMedia(@Query() query: MediaQueryDto): Promise<PaginatedResult<MediaResponseDto>> {
    return this.mediaService.listMediaAssets({
      filters: {
        search: query.search,
        filename: query.filename,
        mimeType: query.mimeType,
        extension: query.extension,
        folderId: query.folderId,
        type: query.type,
        status: query.status,
        uploadedBy: query.uploadedBy,
        createdFrom: query.createdFrom ? new Date(query.createdFrom) : undefined,
        createdTo: query.createdTo ? new Date(query.createdTo) : undefined,
      },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get(':id')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Get a media asset by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaResponseDto)
  async getMedia(@Param('id') id: string): Promise<MediaResponseDto> {
    return this.mediaService.getMediaAsset(id);
  }

  @Get(':id/usages')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'List every detected structural reference to this media asset' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaUsageReferenceDto, { isArray: true })
  async getUsages(@Param('id') id: string): Promise<MediaUsageReferenceDto[]> {
    return this.mediaService.getUsages(id);
  }

  @Get(':id/duplicates')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Find likely duplicates (heuristic: same mimeType + filesize)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaResponseDto, { isArray: true })
  async getDuplicates(@Param('id') id: string): Promise<MediaResponseDto[]> {
    return this.mediaService.findDuplicates(id);
  }

  @Post()
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Register a media asset (metadata only — no file upload/transfer)' })
  @ApiWrappedResponse(MediaResponseDto)
  async createMedia(
    @Body() dto: CreateMediaAssetDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.mediaService.createMediaAsset(dto, { id: user.id });
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Update media metadata (altText/caption/credit/status)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaResponseDto)
  async updateMedia(
    @Param('id') id: string,
    @Body() dto: UpdateMediaAssetDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.mediaService.updateMediaAsset(id, dto, { id: user.id });
  }

  @Post(':id/rename')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Rename (logical display name only — storageKey is never changed)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaResponseDto)
  async renameMedia(
    @Param('id') id: string,
    @Body() dto: RenameMediaAssetDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.mediaService.renameMediaAsset(id, dto, { id: user.id });
  }

  @Post(':id/move')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Move to a folder (stored in metadata.folderId — no real FK exists)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaResponseDto)
  async moveMedia(
    @Param('id') id: string,
    @Body() dto: MoveMediaAssetDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.mediaService.moveMediaAsset(id, dto, { id: user.id });
  }

  @Post(':id/copy-metadata')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Copy altText/caption/credit/filename from :id onto another asset' })
  @ApiParam({ name: 'id', description: 'Source asset id' })
  @ApiWrappedResponse(MediaResponseDto)
  async copyMetadata(
    @Param('id') id: string,
    @Body() dto: CopyMediaMetadataDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.mediaService.copyMetadata(id, dto, { id: user.id });
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.MEDIA_DELETE)
  @ApiOperation({ summary: 'Soft-delete a media asset (rejected if still referenced anywhere)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaResponseDto)
  async deleteMedia(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.mediaService.deleteMediaAsset(id, { id: user.id });
  }

  @Post(':id/restore')
  @RequirePermission(PERMISSIONS.MEDIA_DELETE)
  @ApiOperation({
    summary:
      'Restore a soft-deleted media asset (reuses media.delete — no media.restore permission exists)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaResponseDto)
  async restoreMedia(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.mediaService.restoreMediaAsset(id, { id: user.id });
  }
}
