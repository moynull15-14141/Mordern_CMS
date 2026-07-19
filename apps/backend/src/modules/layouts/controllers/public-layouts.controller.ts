import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { PublicLayoutsService } from '../services/public-layouts.service';
import { PublicLayoutResolveQueryDto } from '../dto/public-layout-resolve-query.dto';
import { PublicLayoutResolutionResponseDto } from '../dto/public-layout-resolution-response.dto';

/**
 * Public Layout resolution (Milestone 14.1) — `@Public()`, no
 * authentication, no `PermissionGuard` (mirrors every other
 * `Public*Controller`). See docs/78_LAYOUT_ENGINE.md.
 */
@ApiTags('Public Layouts')
@Public()
@Controller('public/layouts')
export class PublicLayoutsController {
  constructor(private readonly publicLayoutsService: PublicLayoutsService) {}

  @Get('resolve')
  @ApiOperation({
    summary:
      'Resolve the explicit-assignment and content-default layout presets for a content target (theme default and system default are resolved on the frontend).',
  })
  @ApiWrappedResponse(PublicLayoutResolutionResponseDto)
  async resolve(
    @Query() query: PublicLayoutResolveQueryDto
  ): Promise<PublicLayoutResolutionResponseDto> {
    return this.publicLayoutsService.resolveLayoutForContent(query.contentType, query.slug);
  }
}
