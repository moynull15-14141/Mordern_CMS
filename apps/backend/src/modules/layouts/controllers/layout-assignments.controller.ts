import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LayoutAssignmentContentType } from '@prisma/client';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PermissionGuard } from '../../authorization/guards/permission.guard';
import { RequirePermission } from '../../authorization/decorators/require-permission.decorator';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CurrentUser } from '../../identity/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../identity/interfaces/authenticated-user.interface';
import { LayoutAssignmentsService } from '../services/layout-assignments.service';
import { AssignLayoutDto } from '../dto/assign-layout.dto';
import { LayoutAssignmentResponseDto } from '../dto/layout-assignment-response.dto';

/**
 * Layout Assignments (Backend Milestone 14.1) — assigns a `Layout` to
 * Homepage/Page/Article/Category. Same single `layout.manage` permission
 * as `LayoutsController` (assigning a layout is part of layout
 * management, not a separate capability). See docs/78_LAYOUT_ENGINE.md.
 */
@ApiTags('Layout Assignments')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.LAYOUT_MANAGE)
@Controller('layout-assignments')
export class LayoutAssignmentsController {
  constructor(private readonly layoutAssignmentsService: LayoutAssignmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List layout assignments, optionally filtered by content type' })
  @ApiQuery({ name: 'contentType', enum: LayoutAssignmentContentType, required: false })
  @ApiWrappedResponse(LayoutAssignmentResponseDto, { isArray: true })
  async listAssignments(
    @Query('contentType') contentType?: LayoutAssignmentContentType
  ): Promise<LayoutAssignmentResponseDto[]> {
    return this.layoutAssignmentsService.listAssignments(contentType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a layout assignment by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(LayoutAssignmentResponseDto)
  async getAssignment(@Param('id') id: string): Promise<LayoutAssignmentResponseDto> {
    return this.layoutAssignmentsService.getAssignment(id);
  }

  @Post()
  @ApiOperation({
    summary:
      'Assign (or re-assign) a layout to a target — Homepage, a specific Page/Article/Category, or a content-type-wide default. Upsert semantics.',
  })
  @ApiWrappedResponse(LayoutAssignmentResponseDto)
  async assignLayout(
    @Body() dto: AssignLayoutDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<LayoutAssignmentResponseDto> {
    return this.layoutAssignmentsService.assignLayout(dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Unassign (soft-delete) a layout assignment' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(LayoutAssignmentResponseDto)
  async unassign(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<LayoutAssignmentResponseDto> {
    return this.layoutAssignmentsService.unassign(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted layout assignment' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(LayoutAssignmentResponseDto)
  async restoreAssignment(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<LayoutAssignmentResponseDto> {
    return this.layoutAssignmentsService.restoreAssignment(id, { id: user.id });
  }
}
