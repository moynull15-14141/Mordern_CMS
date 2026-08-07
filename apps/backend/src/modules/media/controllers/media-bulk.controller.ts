import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { RequirePermission } from '../../authorization/decorators/require-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { MediaBulkService } from '../services/media-bulk.service';
import {
  BulkActionResultDto,
  BulkMediaActionDto,
  BulkMoveMediaDto,
  PermanentDeleteMediaDto,
} from '../dto/bulk-media-action.dto';

/**
 * Bulk actions (Milestone 5) — partial-success `{succeeded[], failed[]}`
 * responses throughout, gated on the same two frozen media permissions
 * (`media.upload`/`media.delete`) — no new permission key.
 */
@ApiTags('Media Bulk Actions')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('media/bulk')
export class MediaBulkController {
  constructor(private readonly bulkService: MediaBulkService) {}

  @Post('move')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Move multiple assets to a folder (or root)' })
  @ApiWrappedResponse(BulkActionResultDto)
  async bulkMove(
    @Body() dto: BulkMoveMediaDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<BulkActionResultDto> {
    return this.bulkService.bulkMove(dto.ids, dto.folderId, { id: user.id });
  }

  @Post('archive')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Archive multiple assets' })
  @ApiWrappedResponse(BulkActionResultDto)
  async bulkArchive(
    @Body() dto: BulkMediaActionDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<BulkActionResultDto> {
    return this.bulkService.bulkArchive(dto.ids, { id: user.id });
  }

  @Post('unarchive')
  @RequirePermission(PERMISSIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Unarchive multiple assets (back to READY)' })
  @ApiWrappedResponse(BulkActionResultDto)
  async bulkUnarchive(
    @Body() dto: BulkMediaActionDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<BulkActionResultDto> {
    return this.bulkService.bulkUnarchive(dto.ids, { id: user.id });
  }

  @Post('restore')
  @RequirePermission(PERMISSIONS.MEDIA_DELETE)
  @ApiOperation({ summary: 'Restore multiple soft-deleted assets' })
  @ApiWrappedResponse(BulkActionResultDto)
  async bulkRestore(
    @Body() dto: BulkMediaActionDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<BulkActionResultDto> {
    return this.bulkService.bulkRestore(dto.ids, { id: user.id });
  }

  @Post('delete')
  @RequirePermission(PERMISSIONS.MEDIA_DELETE)
  @ApiOperation({ summary: 'Soft-delete multiple assets (rejected per-item if still referenced)' })
  @ApiWrappedResponse(BulkActionResultDto)
  async bulkDelete(
    @Body() dto: BulkMediaActionDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<BulkActionResultDto> {
    return this.bulkService.bulkDelete(dto.ids, { id: user.id });
  }

  @Delete(':id/permanent')
  @RequirePermission(PERMISSIONS.MEDIA_DELETE)
  @ApiOperation({
    summary:
      'Permanently delete an already soft-deleted asset ("Trash, then Purge") — requires confirm: true',
  })
  @ApiParam({ name: 'id' })
  async permanentDelete(
    @Param('id') id: string,
    @Body() dto: PermanentDeleteMediaDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    return this.bulkService.permanentDelete(id, dto.confirm, { id: user.id });
  }
}
