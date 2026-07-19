import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PublicPagesService } from '../services/public-pages.service';
import { PublicPageResponseDto } from '../dto/public-page-response.dto';

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

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a published page by slug — public, no auth' })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(PublicPageResponseDto)
  async getPageBySlug(@Param('slug') slug: string): Promise<PublicPageResponseDto> {
    return this.publicPagesService.getPageBySlug(slug);
  }
}
