import { Injectable } from '@nestjs/common';
import { ThemesRepository } from '../repositories/themes.repository';
import { ThemesMapper } from '../mappers/themes.mapper';
import { PublicThemeResponseDto } from '../dto/public-theme-response.dto';
import { NoActiveThemeException } from '../exceptions/theme.exceptions';

/**
 * Public read path — deliberately a separate injectable from
 * `ThemesService`, mirroring `PublicMenusService`'s exact reasoning: (1)
 * it never needs `ThemesValidator`/`AuditLoggerService` (no writes happen
 * here), and (2) isolating it gives a future caching layer one narrow
 * class to wrap without touching admin CRUD.
 */
@Injectable()
export class PublicThemesService {
  constructor(
    private readonly repository: ThemesRepository,
    private readonly mapper: ThemesMapper
  ) {}

  /** Cache-readiness seam, same pattern `PublicMenusService.withCache`
   * establishes — today a pass-through, no cache implemented. Recommended
   * future key: `theme:{siteId}:active`. */
  private async withCache<T>(_cacheKey: string, resolver: () => Promise<T>): Promise<T> {
    return resolver();
  }

  async getActiveTheme(): Promise<PublicThemeResponseDto> {
    const site = await this.repository.getDefaultSite();
    return this.withCache(`theme:${site.id}:active`, async () => {
      const theme = await this.repository.findActive(site.id);
      if (!theme) {
        throw new NoActiveThemeException();
      }
      return this.mapper.toPublicResponseDto(theme);
    });
  }
}
