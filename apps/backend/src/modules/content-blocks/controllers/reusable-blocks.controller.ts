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
import { ReusableBlocksService } from '../services/reusable-blocks.service';
import { CreateReusableBlockDto } from '../dto/create-reusable-block.dto';
import { UpdateReusableBlockDto } from '../dto/update-reusable-block.dto';
import { ReusableBlockQueryDto } from '../dto/reusable-block-query.dto';
import { ReusableBlockResponseDto } from '../dto/reusable-block-response.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * Reusable Blocks admin CRUD (Rich Content Engine, Phase 1 / Step 1).
 * Gated by the existing `page.manage` permission — deliberately reusing it
 * rather than adding a new key to the frozen 21-entry `PERMISSIONS`
 * vocabulary (same precedent `TagsController` already sets by reusing
 * `category.create`). Every endpoint is class-level guarded — no ownership
 * split, matching Layouts/Pages/Menus/Themes/Settings.
 */
@ApiTags('Content Blocks')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.PAGE_MANAGE)
@Controller('content-blocks/reusable')
export class ReusableBlocksController {
  constructor(private readonly reusableBlocksService: ReusableBlocksService) {}

  @Get()
  @ApiOperation({ summary: 'List/search/filter/sort reusable blocks (paginated)' })
  @ApiWrappedResponse(ReusableBlockResponseDto, { isArray: true })
  async listReusableBlocks(
    @Query() query: ReusableBlockQueryDto
  ): Promise<PaginatedResult<ReusableBlockResponseDto>> {
    return this.reusableBlocksService.listReusableBlocks({
      filters: { blockType: query.blockType, search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reusable block by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ReusableBlockResponseDto)
  async getReusableBlock(@Param('id') id: string): Promise<ReusableBlockResponseDto> {
    return this.reusableBlocksService.getReusableBlock(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a reusable block' })
  @ApiWrappedResponse(ReusableBlockResponseDto)
  async createReusableBlock(
    @Body() dto: CreateReusableBlockDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ReusableBlockResponseDto> {
    return this.reusableBlocksService.createReusableBlock(dto, { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reusable block (name and/or data)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ReusableBlockResponseDto)
  async updateReusableBlock(
    @Param('id') id: string,
    @Body() dto: UpdateReusableBlockDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ReusableBlockResponseDto> {
    return this.reusableBlocksService.updateReusableBlock(id, dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a reusable block' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ReusableBlockResponseDto)
  async deleteReusableBlock(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ReusableBlockResponseDto> {
    return this.reusableBlocksService.deleteReusableBlock(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted reusable block' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(ReusableBlockResponseDto)
  async restoreReusableBlock(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<ReusableBlockResponseDto> {
    return this.reusableBlocksService.restoreReusableBlock(id, { id: user.id });
  }
}
