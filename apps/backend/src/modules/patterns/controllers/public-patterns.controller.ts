import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiWrappedResponse } from '../../../core/responses/api-response.swagger';
import { Public } from '../../identity/decorators/public.decorator';
import { PublicPatternsService } from '../services/public-patterns.service';
import { PublicPatternResponseDto } from '../dto/public-pattern-response.dto';

/**
 * Public Patterns API (Milestone 6) — used only by the admin preview
 * iframe (`apps/web`'s `/preview/patterns/[id]` route). Mirrors
 * `PublicContentBlocksController` exactly, including why it's a separate
 * controller from `PatternsController` (that controller carries a
 * class-level `PermissionGuard`, which would make any route inside it
 * never truly public).
 */
@ApiTags('Public Patterns')
@Public()
@Controller('public/patterns')
export class PublicPatternsController {
  constructor(private readonly publicPatternsService: PublicPatternsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Resolve a pattern by id for preview rendering — public, no auth' })
  @ApiParam({ name: 'id' })
  @ApiWrappedResponse(PublicPatternResponseDto)
  async getPattern(@Param('id') id: string): Promise<PublicPatternResponseDto> {
    return this.publicPatternsService.getPattern(id);
  }
}
