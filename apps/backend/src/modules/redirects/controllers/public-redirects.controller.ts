import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PublicRedirectsService } from '../services/public-redirects.service';
import { PublicRedirectResponseDto } from '../dto/redirect-response.dto';

/**
 * Public Redirects API — powers `apps/web`'s content resolver (checked
 * only after normal Page/Article/Category resolution comes back
 * not-found, right before the final 404 response — see this milestone's
 * URL Resolution Order notes). A missing redirect surfaces as a real 404
 * (not a 200 with a null body), matching every other Public* service's
 * "no dedicated search endpoint, just a real not-found" contract on the
 * web side (`PublicApiError.status === 404`).
 */
@ApiTags('Public Redirects')
@Public()
@Controller('public/redirects')
export class PublicRedirectsController {
  constructor(private readonly publicRedirectsService: PublicRedirectsService) {}

  @Get('lookup')
  @ApiOperation({ summary: 'Look up an active redirect for an exact path — public, no auth' })
  @ApiQuery({ name: 'path' })
  @ApiWrappedResponse(PublicRedirectResponseDto)
  async lookup(@Query('path') path: string): Promise<PublicRedirectResponseDto> {
    const result = await this.publicRedirectsService.lookup(path ?? '');
    if (!result) {
      throw new NotFoundException(`No redirect exists for "${path}".`);
    }
    return result;
  }
}
