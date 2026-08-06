import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PublicContentBlocksService } from '../services/public-content-blocks.service';
import { PublicReusableBlockResponseDto } from '../dto/public-reusable-block-response.dto';

/**
 * Public Content Blocks API (Rich Content Engine, Phase 1 / Step 1) —
 * resolves a `reusable-block` reference node's `data` for the public
 * renderer. Deliberately a separate controller from
 * `ReusableBlocksController` (not `@Public()` routes bolted onto it) —
 * same reasoning `PublicThemesController`'s doc comment gives: that
 * controller carries a class-level `PermissionGuard`, and the guard reads
 * that metadata off the class, so a route inside it can never truly be
 * public.
 */
@ApiTags('Public Content Blocks')
@Public()
@Controller('public/content-blocks')
export class PublicContentBlocksController {
  constructor(private readonly publicContentBlocksService: PublicContentBlocksService) {}

  @Get('reusable/:id')
  @ApiOperation({ summary: 'Resolve a reusable block by id — public, no auth' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PublicReusableBlockResponseDto)
  async getReusableBlock(@Param('id') id: string): Promise<PublicReusableBlockResponseDto> {
    return this.publicContentBlocksService.getReusableBlock(id);
  }
}
