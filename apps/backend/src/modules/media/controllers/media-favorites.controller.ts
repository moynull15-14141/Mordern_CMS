import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { RequireAnyPermission } from '../../authorization/decorators/require-any-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { MediaFavoritesService } from '../services/media-favorites.service';
import { MediaResponseDto } from '../dto/media-response.dto';

const ANY_MEDIA_PERMISSION = [PERMISSIONS.MEDIA_UPLOAD, PERMISSIONS.MEDIA_DELETE];

/**
 * Favorites (per-user) / Recent (per-user) / Pinned (global) — gated on the
 * existing `media.upload`/`media.delete` permissions only, no new
 * permission key (this module's vocabulary is deliberately frozen — see
 * docs/48_MEDIA_LIBRARY_ARCHITECTURE.md Conflict #6).
 */
@ApiTags('Media Favorites')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('media')
export class MediaFavoritesController {
  constructor(private readonly favoritesService: MediaFavoritesService) {}

  @Get('favorites')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: "List the current user's favorited assets" })
  @ApiWrappedResponse(MediaResponseDto, { isArray: true })
  async listFavorites(@CurrentUser() user: AuthenticatedUser): Promise<MediaResponseDto[]> {
    return this.favoritesService.listFavorites({ id: user.id });
  }

  @Post(':id/favorite')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Favorite an asset (per-user)' })
  @ApiParam({ name: 'id' })
  async addFavorite(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    return this.favoritesService.addFavorite(id, { id: user.id });
  }

  @Delete(':id/favorite')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Unfavorite an asset (per-user)' })
  @ApiParam({ name: 'id' })
  async removeFavorite(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    return this.favoritesService.removeFavorite(id, { id: user.id });
  }

  @Get('recent')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: "List the current user's recently viewed assets (bounded log)" })
  @ApiWrappedResponse(MediaResponseDto, { isArray: true })
  async listRecent(@CurrentUser() user: AuthenticatedUser): Promise<MediaResponseDto[]> {
    return this.favoritesService.listRecent({ id: user.id });
  }

  @Post(':id/view')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({
    summary: 'Record a view of this asset (upsert into the bounded recent-views log)',
  })
  @ApiParam({ name: 'id' })
  async recordView(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    return this.favoritesService.recordView(id, { id: user.id });
  }

  @Get('pinned')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'List globally/site-wide pinned assets' })
  @ApiWrappedResponse(MediaResponseDto, { isArray: true })
  async listPinned(): Promise<MediaResponseDto[]> {
    return this.favoritesService.listPinned();
  }

  @Post(':id/pin')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Pin an asset globally/site-wide' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaResponseDto)
  async pin(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.favoritesService.pin(id, { id: user.id });
  }

  @Delete(':id/pin')
  @RequireAnyPermission(...ANY_MEDIA_PERMISSION)
  @ApiOperation({ summary: 'Unpin an asset' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(MediaResponseDto)
  async unpin(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaResponseDto> {
    return this.favoritesService.unpin(id, { id: user.id });
  }
}
