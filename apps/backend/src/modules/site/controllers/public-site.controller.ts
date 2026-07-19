import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PublicSiteService } from '../services/public-site.service';
import { PublicSiteResponseDto } from '../dto/public-site-response.dto';

/**
 * Public Site API (Backend Milestone 13.2) — no admin `SitesController`
 * exists to mirror the "separate Public controller" pattern against (see
 * docs/75_BACKEND_PUBLIC_CONTENT_API.md "Known Limitations"); this is the
 * first Site-facing endpoint in the backend, `@Public()` from the start.
 */
@ApiTags('Public Site')
@Public()
@Controller('public/site')
export class PublicSiteController {
  constructor(private readonly publicSiteService: PublicSiteService) {}

  @Get()
  @ApiOperation({ summary: 'Get current site info + active theme reference — public, no auth' })
  @ApiWrappedResponse(PublicSiteResponseDto)
  async getSite(): Promise<PublicSiteResponseDto> {
    return this.publicSiteService.getSite();
  }
}
