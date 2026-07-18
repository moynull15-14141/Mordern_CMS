import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PublicThemesService } from '../services/public-themes.service';
import { PublicThemeResponseDto } from '../dto/public-theme-response.dto';

/**
 * Public Appearance API (Backend Milestone 12) — powers the future Public
 * Website's rendering of logo/favicon/colors/typography/layout/custom CSS
 * &amp; JS. Deliberately a separate controller from `ThemesController`,
 * not `@Public()` routes bolted onto it — same reasoning
 * `PublicMenusController`'s own doc comment gives: `ThemesController`
 * carries a class-level `@UseGuards(PermissionGuard)` +
 * `@RequirePermission(PERMISSIONS.THEME_MANAGE)`, and `PermissionGuard`
 * reads that metadata off the class too, so a route inside it can never
 * truly be public. No guards at all here, matching `AuthController`'s own
 * `@Public()` routes.
 */
@ApiTags('Public Appearance')
@Public()
@Controller('public/theme')
export class PublicThemesController {
  constructor(private readonly publicThemesService: PublicThemesService) {}

  @Get()
  @ApiOperation({ summary: "Get the site's active theme appearance settings — public, no auth" })
  @ApiWrappedResponse(PublicThemeResponseDto)
  async getActiveTheme(): Promise<PublicThemeResponseDto> {
    return this.publicThemesService.getActiveTheme();
  }
}
