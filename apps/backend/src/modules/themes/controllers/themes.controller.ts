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
import { ThemesService } from '../services/themes.service';
import { CreateThemeDto } from '../dto/create-theme.dto';
import { UpdateThemeDto } from '../dto/update-theme.dto';
import { ThemeQueryDto } from '../dto/theme-query.dto';
import { ThemeResponseDto } from '../dto/theme-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * Themes Foundation (Backend Milestone 12). Every endpoint requires the
 * single frozen `theme.manage` permission (class-level guard) — no
 * ownership split, matching Pages/Menus/Settings (no `authorId` on
 * `Theme`). See docs/72_BACKEND_THEMES.md.
 */
@ApiTags('Themes')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.THEME_MANAGE)
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get()
  @ApiOperation({ summary: 'List/search/filter/sort themes (paginated)' })
  @ApiWrappedResponse(ThemeResponseDto, { isArray: true })
  async listThemes(@Query() query: ThemeQueryDto): Promise<PaginatedResult<ThemeResponseDto>> {
    return this.themesService.listThemes({
      filters: { status: query.status, isActive: query.isActive, search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  // `active` MUST be registered before the `:id` catch-all — same
  // route-ordering requirement `ArticlesController`/`PagesController`/
  // `PublicMenusController` already follow for their own static-segment
  // vs dynamic-param routes.
  @Get('active')
  @ApiOperation({ summary: "Get the site's currently active theme" })
  @ApiWrappedResponse(ThemeResponseDto)
  async getActiveTheme(): Promise<ThemeResponseDto> {
    return this.themesService.getActiveTheme();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a theme by id (also serves as "preview" — full metadata, no separate endpoint)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ThemeResponseDto)
  async getTheme(@Param('id') id: string): Promise<ThemeResponseDto> {
    return this.themesService.getTheme(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a theme (starts DRAFT, inactive)' })
  @ApiWrappedResponse(ThemeResponseDto)
  async createTheme(
    @Body() dto: CreateThemeDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ThemeResponseDto> {
    return this.themesService.createTheme(dto, { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a theme (name/slug/version/author/description/thumbnail/status/settings)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ThemeResponseDto)
  async updateTheme(
    @Param('id') id: string,
    @Body() dto: UpdateThemeDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ThemeResponseDto> {
    return this.themesService.updateTheme(id, dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a theme' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ThemeResponseDto)
  async deleteTheme(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ThemeResponseDto> {
    return this.themesService.deleteTheme(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted theme' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ThemeResponseDto)
  async restoreTheme(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ThemeResponseDto> {
    return this.themesService.restoreTheme(id, { id: user.id });
  }

  @Post(':id/activate')
  @ApiOperation({
    summary: "Activate a theme — automatically deactivates the site's previous active theme",
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ThemeResponseDto)
  async activateTheme(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ThemeResponseDto> {
    return this.themesService.activateTheme(id, { id: user.id });
  }
}
