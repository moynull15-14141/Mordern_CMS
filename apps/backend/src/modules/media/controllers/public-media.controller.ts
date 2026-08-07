import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PublicMediaService } from '../services/public-media.service';
import { PublicMediaResponseDto } from '../dto/public-media-response.dto';

/**
 * Public Media API (Milestone 5) — resolves a `media-ref` block field's
 * `mediaId` for the public renderer. Mirrors
 * `PublicContentBlocksController` exactly, including why it's a separate
 * controller from `MediaController` (that controller carries a class-level
 * `PermissionGuard`, which would make any route inside it never truly
 * public).
 */
@ApiTags('Public Media')
@Public()
@Controller('public/media')
export class PublicMediaController {
  constructor(private readonly publicMediaService: PublicMediaService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Resolve a media asset by id for public rendering — public, no auth' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PublicMediaResponseDto)
  async getMedia(@Param('id') id: string): Promise<PublicMediaResponseDto> {
    return this.publicMediaService.getMedia(id);
  }
}
