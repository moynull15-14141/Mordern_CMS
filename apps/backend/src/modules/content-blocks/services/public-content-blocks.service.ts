import { Injectable } from '@nestjs/common';
import { ReusableBlockRepository } from '../repositories/reusable-block.repository';
import { PublicReusableBlockResponseDto } from '../dto/public-reusable-block-response.dto';
import { ReusableBlockNotFoundException } from '../exceptions/content-blocks.exceptions';

/**
 * Public read path for resolving a `reusable-block` reference node during
 * rendering — deliberately a separate injectable from `ReusableBlocksService`,
 * mirroring `PublicThemesService`'s exact reasoning: never needs
 * `BlockTreeValidator`/`AuditLoggerService` (no writes happen here), and
 * isolating it gives a future caching layer one narrow class to wrap
 * without touching admin CRUD.
 */
@Injectable()
export class PublicContentBlocksService {
  constructor(private readonly repository: ReusableBlockRepository) {}

  private async withCache<T>(_cacheKey: string, resolver: () => Promise<T>): Promise<T> {
    return resolver();
  }

  async getReusableBlock(id: string): Promise<PublicReusableBlockResponseDto> {
    return this.withCache(`reusable-block:${id}`, async () => {
      const block = await this.repository.findById(id);
      if (!block) {
        throw new ReusableBlockNotFoundException(id);
      }
      return {
        id: block.id,
        blockType: block.blockType,
        data: block.data,
        children: (block.children as unknown[] | null) ?? undefined,
      };
    });
  }
}
