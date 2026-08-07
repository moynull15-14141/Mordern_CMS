import { Injectable } from '@nestjs/common';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PatternFavoriteRepository } from '../repositories/pattern-favorite.repository';
import { PatternRepository } from '../repositories/pattern.repository';
import { PatternMapper } from '../mappers/pattern.mapper';
import { PatternSummaryDto } from '../dto/pattern-response.dto';
import { PatternNotFoundException } from '../exceptions/pattern.exceptions';

interface ActingUser {
  id: string;
}

/** Favorites — per-user, server-persisted (cross-device), mirroring
 * `MediaFavoritesService`'s favorite half exactly. Gated on the existing
 * `page.manage` permission only — no new permission key. */
@Injectable()
export class PatternFavoritesService {
  constructor(
    private readonly favoriteRepository: PatternFavoriteRepository,
    private readonly repository: PatternRepository,
    private readonly mapper: PatternMapper,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async assertPatternExists(id: string): Promise<void> {
    const pattern = await this.repository.findById(id);
    if (!pattern) {
      throw new PatternNotFoundException(id);
    }
  }

  async addFavorite(id: string, actor: ActingUser): Promise<void> {
    await this.assertPatternExists(id);
    await this.favoriteRepository.addFavorite(actor.id, id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'pattern.favorite_add',
      resource: 'pattern',
      resourceId: id,
      result: 'success',
    });
  }

  async removeFavorite(id: string, actor: ActingUser): Promise<void> {
    await this.favoriteRepository.removeFavorite(actor.id, id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'pattern.favorite_remove',
      resource: 'pattern',
      resourceId: id,
      result: 'success',
    });
  }

  async listFavorites(actor: ActingUser): Promise<PatternSummaryDto[]> {
    const site = await this.repository.getDefaultSite();
    const patterns = await this.favoriteRepository.findFavoritePatterns(actor.id, site.id);
    return patterns.map((pattern) => this.mapper.toSummaryDto(pattern));
  }
}
