import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PublicMenusService } from '../services/public-menus.service';
import { PublicMenuResponseDto } from '../dto/public-menu-response.dto';

/**
 * Public Navigation API (Backend Milestone 11.3) — powers the future
 * Public Website's header/footer/sidebar rendering. Deliberately a
 * separate controller from `MenusController`, not `@Public()` routes
 * added to it: that controller carries a class-level
 * `@UseGuards(PermissionGuard)` + `@RequirePermission(PERMISSIONS.MENU_MANAGE)`,
 * and `PermissionGuard` checks `@RequirePermission` metadata on both the
 * handler AND the class — so a route inside it can never truly be public,
 * `@Public()` only bypasses the global `JwtAuthGuard`, not an explicitly
 * `@UseGuards`-attached guard. No permission check at all here, matching
 * `AuthController`'s own `@Public()` routes (e.g. `/auth/login`).
 */
@ApiTags('Public Navigation')
@Public()
@Controller('public/menus')
export class PublicMenusController {
  constructor(private readonly publicMenusService: PublicMenusService) {}

  // `slug/:slug` MUST be registered before the `:location` catch-all —
  // same route-ordering requirement `ArticlesController`/`PagesController`
  // already follow (`slug/:slug` before `:id`). Reversed, a request for
  // `/public/menus/slug/header` would match `:location` first with
  // `location="slug"` and never reach this handler.
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get the published menu (nested tree) by slug — public, no auth' })
  @ApiParam({ name: 'slug' })
  @ApiWrappedResponse(PublicMenuResponseDto)
  async getMenuBySlug(@Param('slug') slug: string): Promise<PublicMenuResponseDto> {
    return this.publicMenusService.getMenuBySlug(slug);
  }

  @Get(':location')
  @ApiOperation({
    summary: 'Get the published menu (nested tree) for a placement location — public, no auth',
  })
  @ApiParam({ name: 'location', example: 'header' })
  @ApiWrappedResponse(PublicMenuResponseDto)
  async getMenuByLocation(@Param('location') location: string): Promise<PublicMenuResponseDto> {
    return this.publicMenusService.getMenuByLocation(location);
  }
}
