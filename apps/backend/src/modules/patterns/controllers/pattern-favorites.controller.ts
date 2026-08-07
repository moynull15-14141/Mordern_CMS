import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { RequirePermission } from '../../authorization/decorators/require-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { PatternFavoritesService } from '../services/pattern-favorites.service';
import { PatternSummaryDto } from '../dto/pattern-response.dto';

/** Favorites (Milestone 6) — gated on the existing `page.manage`
 * permission only, no new permission key (same frozen-vocabulary
 * reasoning `PatternsController` documents). */
@ApiTags('Pattern Favorites')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.PAGE_MANAGE)
@Controller('patterns')
export class PatternFavoritesController {
  constructor(private readonly favoritesService: PatternFavoritesService) {}

  @Get('favorites')
  @ApiOperation({ summary: "List the current user's favorited patterns" })
  @ApiWrappedResponse(PatternSummaryDto, { isArray: true })
  async listFavorites(@CurrentUser() user: AuthenticatedUser): Promise<PatternSummaryDto[]> {
    return this.favoritesService.listFavorites({ id: user.id });
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Favorite a pattern (per-user)' })
  @ApiParam({ name: 'id' })
  async addFavorite(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    return this.favoritesService.addFavorite(id, { id: user.id });
  }

  @Delete(':id/favorite')
  @ApiOperation({ summary: 'Unfavorite a pattern (per-user)' })
  @ApiParam({ name: 'id' })
  async removeFavorite(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    return this.favoritesService.removeFavorite(id, { id: user.id });
  }
}
