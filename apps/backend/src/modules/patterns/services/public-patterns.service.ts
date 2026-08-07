import { Injectable } from '@nestjs/common';
import { PatternRepository } from '../repositories/pattern.repository';
import { PatternMapper } from '../mappers/pattern.mapper';
import { PublicPatternResponseDto } from '../dto/public-pattern-response.dto';
import { PatternNotFoundException } from '../exceptions/pattern.exceptions';

/**
 * Public read path used only by the admin preview iframe (via
 * `apps/web`'s `/preview/patterns/[id]` route, rendered through the
 * existing public Block Renderer — see that route's doc comment). Mirrors
 * `PublicContentBlocksService`'s exact reasoning: deliberately separate
 * from `PatternsService` (never needs site-scoping-by-actor/validation/
 * `AuditLoggerService`, no writes happen here). Not linked from anywhere
 * in the real public site's navigation — a valid but unlisted preview id
 * is the same "no auth, no listing" tradeoff `PublicContentBlocksService`
 * already accepts for reusable blocks.
 */
@Injectable()
export class PublicPatternsService {
  constructor(
    private readonly repository: PatternRepository,
    private readonly mapper: PatternMapper
  ) {}

  async getPattern(id: string): Promise<PublicPatternResponseDto> {
    const pattern = await this.repository.findById(id);
    if (!pattern) {
      throw new PatternNotFoundException(id);
    }
    return this.mapper.toPublicResponseDto(pattern);
  }
}
