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
import { PatternsService } from '../services/patterns.service';
import { CreatePatternDto } from '../dto/create-pattern.dto';
import { UpdatePatternDto } from '../dto/update-pattern.dto';
import { PatternQueryDto } from '../dto/pattern-query.dto';
import { PatternResponseDto, PatternSummaryDto } from '../dto/pattern-response.dto';
import { PatternUsageReferenceDto } from '../dto/pattern-usage.dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

/**
 * Section & Pattern Library admin CRUD (Milestone 6). Gated by the
 * existing `page.manage` permission — deliberately reusing it rather than
 * adding a new key to the frozen 21-entry `PERMISSIONS` vocabulary, same
 * precedent `ReusableBlocksController` already sets. Every endpoint is
 * class-level guarded — no ownership split, matching Layouts/Pages/Menus/
 * Themes/Settings/ReusableBlocks.
 */
@ApiTags('Patterns')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.PAGE_MANAGE)
@Controller('patterns')
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}

  @Get()
  @ApiOperation({
    summary: 'List/search/filter/sort patterns (paginated, lightweight summary shape)',
  })
  @ApiWrappedResponse(PatternSummaryDto, { isArray: true })
  async listPatterns(@Query() query: PatternQueryDto): Promise<PaginatedResult<PatternSummaryDto>> {
    return this.patternsService.listPatterns({
      filters: {
        search: query.search,
        category: query.category,
        tags: query.tags
          ? query.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : undefined,
        status: query.status,
      },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pattern by id (full block tree)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PatternResponseDto)
  async getPattern(@Param('id') id: string): Promise<PatternResponseDto> {
    return this.patternsService.getPattern(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a pattern from a block tree' })
  @ApiWrappedResponse(PatternResponseDto)
  async createPattern(
    @Body() dto: CreatePatternDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PatternResponseDto> {
    return this.patternsService.createPattern(dto, { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a pattern (name/slug/description/category/tags/thumbnail/body)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PatternResponseDto)
  async updatePattern(
    @Param('id') id: string,
    @Body() dto: UpdatePatternDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PatternResponseDto> {
    return this.patternsService.updatePattern(id, dto, { id: user.id });
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a pattern (new id, uniquified name/slug, identical body)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PatternResponseDto)
  async duplicatePattern(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PatternResponseDto> {
    return this.patternsService.duplicatePattern(id, { id: user.id });
  }

  @Post(':id/archive')
  @ApiOperation({
    summary: 'Archive a pattern (hidden from the default library view, not deleted)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PatternResponseDto)
  async archivePattern(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PatternResponseDto> {
    return this.patternsService.archivePattern(id, { id: user.id });
  }

  @Post(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a pattern (back to ACTIVE)' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PatternResponseDto)
  async unarchivePattern(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PatternResponseDto> {
    return this.patternsService.unarchivePattern(id, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a pattern' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PatternResponseDto)
  async deletePattern(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PatternResponseDto> {
    return this.patternsService.deletePattern(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted pattern' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PatternResponseDto)
  async restorePattern(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PatternResponseDto> {
    return this.patternsService.restorePattern(id, { id: user.id });
  }

  @Get(':id/usages')
  @ApiOperation({
    summary:
      'List every Page/Article/ReusableBlock whose body was ever inserted from this pattern (detached-copy provenance, not a live reference)',
  })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PatternUsageReferenceDto, { isArray: true })
  async getUsages(@Param('id') id: string): Promise<PatternUsageReferenceDto[]> {
    return this.patternsService.getUsages(id);
  }
}
