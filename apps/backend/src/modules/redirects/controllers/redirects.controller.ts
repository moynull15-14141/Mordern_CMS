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
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { RedirectsService } from '../services/redirects.service';
import { CreateRedirectDto } from '../dto/create-redirect.dto';
import { UpdateRedirectDto } from '../dto/update-redirect.dto';
import { RedirectQueryDto } from '../dto/redirect-query.dto';
import { RedirectResponseDto } from '../dto/redirect-response.dto';

/** No `redirect.*` permission exists (frozen vocabulary) — every endpoint
 * reuses `page.manage`, the closest existing content/site-management
 * permission, exactly matching `TagsController`'s own reasoning for
 * reusing `category.create`. */
@ApiTags('Redirects')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@RequirePermission(PERMISSIONS.PAGE_MANAGE)
@Controller('redirects')
export class RedirectsController {
  constructor(private readonly redirectsService: RedirectsService) {}

  @Get()
  @ApiOperation({ summary: 'List/search/sort redirects (paginated)' })
  @ApiWrappedResponse(RedirectResponseDto, { isArray: true })
  async listRedirects(
    @Query() query: RedirectQueryDto
  ): Promise<PaginatedResult<RedirectResponseDto>> {
    return this.redirectsService.listRedirects({
      filters: { status: query.status, search: query.search },
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
      page: query.page!,
      limit: query.limit!,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a redirect by id' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(RedirectResponseDto)
  async getRedirect(@Param('id') id: string): Promise<RedirectResponseDto> {
    return this.redirectsService.getRedirect(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a redirect' })
  @ApiWrappedResponse(RedirectResponseDto)
  async createRedirect(
    @Body() dto: CreateRedirectDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<RedirectResponseDto> {
    return this.redirectsService.createRedirect(dto, { id: user.id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a redirect' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(RedirectResponseDto)
  async updateRedirect(
    @Param('id') id: string,
    @Body() dto: UpdateRedirectDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<RedirectResponseDto> {
    return this.redirectsService.updateRedirect(id, dto, { id: user.id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a redirect' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(RedirectResponseDto)
  async deleteRedirect(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<RedirectResponseDto> {
    return this.redirectsService.deleteRedirect(id, { id: user.id });
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted redirect' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(RedirectResponseDto)
  async restoreRedirect(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<RedirectResponseDto> {
    return this.redirectsService.restoreRedirect(id, { id: user.id });
  }
}
