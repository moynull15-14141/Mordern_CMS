import { ApiProperty } from '@nestjs/swagger';

/**
 * Lightweight pointer to the site's active theme — reused from
 * `PublicThemesService.getActiveTheme()`'s already-computed result
 * (trimmed to `id`/`name`/`slug`), not a new query. The full appearance
 * payload (colors/typography/layout/logo/favicon/customCss/customJs) stays
 * exclusively at `GET /public/theme` — duplicating it here would create
 * two conflicting sources of truth for the same data.
 */
export class PublicSiteActiveThemeDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

/**
 * Public, rendering-only shape for the current `Site` — powers
 * `GET /public/site` (Milestone 13.2). Excludes `id`, `slug`, `domain`
 * (routing/infrastructure detail, not rendering data), `status` (always
 * ACTIVE — a deleted/inactive site never resolves at all, see
 * `PublicSiteService`), the legacy unused `theme` JSON blob
 * (`config/prisma/schema.prisma`'s own `Site.theme` doc comment calls it
 * "a loose blob never wired to any module" — exposing it would surface
 * meaningless data), `seoDefaults` (also unwired — grepping the backend
 * finds no reader of this column anywhere), and every audit field.
 */
export class PublicSiteResponseDto {
  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  locale!: string | null;

  @ApiProperty({ nullable: true })
  timezone!: string | null;

  @ApiProperty({ type: PublicSiteActiveThemeDto, nullable: true })
  activeTheme!: PublicSiteActiveThemeDto | null;
}
