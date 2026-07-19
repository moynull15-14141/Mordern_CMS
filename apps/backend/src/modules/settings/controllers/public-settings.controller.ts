import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PublicSettingsService } from '../services/public-settings.service';
import { PublicSettingResponseDto } from '../dto/public-setting-response.dto';

/**
 * Public Settings API (Backend Milestone 13.2). Deliberately a separate
 * controller from `SettingsController`, not `@Public()` routes added to
 * it — same reasoning `PublicPagesController`'s doc comment gives:
 * `SettingsController` carries a class-level `@UseGuards(PermissionGuard)`
 * + `@RequirePermission(PERMISSIONS.SETTINGS_MANAGE)`, so a route inside
 * it can never truly be public. Returns only the closed allowlist in
 * `PUBLIC_SETTING_KEYS` — never "every setting" (see
 * `PublicSettingsService`).
 */
@ApiTags('Public Settings')
@Public()
@Controller('public/settings')
export class PublicSettingsController {
  constructor(private readonly publicSettingsService: PublicSettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get the allowlisted settings safe for public rendering — public, no auth',
  })
  @ApiWrappedResponse(PublicSettingResponseDto, { isArray: true })
  async getPublicSettings(): Promise<PublicSettingResponseDto[]> {
    return this.publicSettingsService.getPublicSettings();
  }
}
