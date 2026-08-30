import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { PublicPagesService } from '../services/public-pages.service';
import { PublicPageQueryDto } from '../dto/public-page-query.dto';
import { PublicPageListItemDto, PublicPageResponseDto } from '../dto/public-page-response.dto';

/**
 * Public Pages API (Backend Milestone 13.2) — powers the Public Rendering
 * Foundation's Content Loader (`docs/74_PUBLIC_RENDERING_FOUNDATION.md`
 * "Known Limitations"). Deliberately a separate controller from
 * `PagesController`, not `@Public()` routes added to it — that controller
 * carries a class-level `@UseGuards(PermissionGuard)` +
 * `@RequirePermission(PERMISSIONS.PAGE_MANAGE)`, and `PermissionGuard`
 * checks that metadata on both the handler AND the class, so a route
 * inside it can never truly be public (same reasoning
 * `PublicMenusController`'s doc comment gives). No permission check at
 * all here, matching `AuthController`'s own `@Public()` routes.
 */
@ApiTags('Public Pages')
@Public()
@Controller('public/pages')
export class PublicPagesController {
  constructor(private readonly publicPagesService: PublicPagesService) {}

  @Get()
  @ApiOperation({ summary: 'List published pages (paginated) — public, no auth' })
  @ApiWrappedResponse(PublicPageListItemDto, { isArray: true })
  async listPages(
    @Query() query: PublicPageQueryDto
  ): Promise<PaginatedResult<PublicPageListItemDto>> {
    return this.publicPagesService.listPages(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a published page by slug — public, no auth' })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(PublicPageResponseDto)
  async getPageBySlug(@Param('slug') slug: string): Promise<PublicPageResponseDto> {
    return this.publicPagesService.getPageBySlug(slug);
  }

  @Get('preview')
  @ApiOperation({
    summary:
      'Resolve a page (any status) via a short-lived preview token — public route, but the token itself is the credential. ' +
      "A query param, not a route param — the signed JWT is long enough to trip Fastify/find-my-way's default " +
      'per-path-param length limit ("exceeding the max param length", a real 414 hit in local testing).',
  })
  @ApiQuery({ name: 'token' })
  @ApiWrappedResponse(PublicPageResponseDto)
  async getPageForPreview(@Query('token') token: string): Promise<PublicPageResponseDto> {
    return this.publicPagesService.getPageForPreview(token);
  }
}
