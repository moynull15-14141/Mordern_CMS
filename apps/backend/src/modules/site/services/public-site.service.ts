import { Injectable } from '@nestjs/common';
import { SiteRepository } from '../repositories/site.repository';
import { PublicThemesService } from '../../themes/services/public-themes.service';
import { NoActiveThemeException } from '../../themes/exceptions/theme.exceptions';
import { PublicSiteResponseDto } from '../dto/public-site-response.dto';

/**
 * Public read path (Milestone 13.2) — the first public API surface for
 * `Site` itself (no admin `SitesController`/`SitesService` exists to
 * delegate to; V1 has no admin Site CRUD at all — see
 * docs/75_BACKEND_PUBLIC_CONTENT_API.md "Known Limitations"). Reuses the
 * real, already-tested `PublicThemesService.getActiveTheme()` for the
 * active-theme reference rather than re-querying `Theme` itself — the only
 * "business logic" here (resolving the default `Site` row) is the same
 * trivial, already-duplicated-four-times convention every other content
 * module's repository carries (see `SiteRepository`'s doc comment).
 *
 * No active theme is a legitimate site state (nothing activated yet), not
 * a failure of this endpoint — `activeTheme` resolves to `null` rather
 * than the whole response failing.
 */
@Injectable()
export class PublicSiteService {
  constructor(
    private readonly siteRepository: SiteRepository,
    private readonly publicThemesService: PublicThemesService
  ) {}

  async getSite(): Promise<PublicSiteResponseDto> {
    const site = await this.siteRepository.getDefaultSite();

    let activeTheme: PublicSiteResponseDto['activeTheme'] = null;
    try {
      const theme = await this.publicThemesService.getActiveTheme();
      activeTheme = { id: theme.id, name: theme.name, slug: theme.slug };
    } catch (error) {
      if (!(error instanceof NoActiveThemeException)) {
        throw error;
      }
    }

    return {
      name: site.name,
      locale: site.locale,
      timezone: site.timezone,
      activeTheme,
    };
  }
}
