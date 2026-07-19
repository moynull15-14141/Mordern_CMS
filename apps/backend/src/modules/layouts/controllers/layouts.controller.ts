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
import { LayoutsService } from '../services/layouts.service';
import { CreateLayoutDto } from '../dto/create-layout.dto';
import { UpdateLayoutDto } from '../dto/update-layout.dto';
import { LayoutQueryDto } from '../dto/layout-query.dto';
import { LayoutResponseDto } from '../dto/layout-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * Layout Engine Foundation (Backend Milestone 14.1). Every endpoint
 * requires the single frozen `layout.manage` permission (class-level
 * guard) — no ownership split, matching Pages/Menus/Themes/Settings (no
 * `authorId` on `Layout`). See docs/78_LAYOUT_ENGINE.md.
 */
@ApiTags('Layouts')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.LAYOUT_MANAGE)
@Controller('layouts')
export class LayoutsController {
  constructor(private readonly layoutsService: LayoutsService) {}

  @Get()
  @ApiOperation({ summary: 'List/search/filter/sort layouts (paginated)' })
  @ApiWrappedResponse(LayoutResponseDto, { isArray: true })
  async listLayouts(@Query() query: LayoutQueryDto): Promise<PaginatedResult<LayoutResponseDto>> {
    return this.layoutsService.listLayouts({
      filters: { status: query.status, themeId: query.themeId, search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a layout by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(LayoutResponseDto)
  async getLayout(@Param('id') id: string): Promise<LayoutResponseDto> {
    return this.layoutsService.getLayout(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a layout (starts DRAFT). Structural only — no blocks/content.' })
  @ApiWrappedResponse(LayoutResponseDto)
  async createLayout(
    @Body() dto: CreateLayoutDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<LayoutResponseDto> {
    return this.layoutsService.createLayout(dto, { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a layout (name/slug/layoutPreset/themeId/status)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(LayoutResponseDto)
  async updateLayout(
    @Param('id') id: string,
    @Body() dto: UpdateLayoutDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<LayoutResponseDto> {
    return this.layoutsService.updateLayout(id, dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a layout' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(LayoutResponseDto)
  async deleteLayout(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<LayoutResponseDto> {
    return this.layoutsService.deleteLayout(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted layout' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(LayoutResponseDto)
  async restoreLayout(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<LayoutResponseDto> {
    return this.layoutsService.restoreLayout(id, { id: user.id });
  }
}
