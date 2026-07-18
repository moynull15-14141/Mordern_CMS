import { ApiProperty } from '@nestjs/swagger';

export class PublicThemeColorsDto {
  @ApiProperty({ nullable: true })
  primary!: string | null;

  @ApiProperty({ nullable: true })
  secondary!: string | null;
}

export class PublicThemeLayoutDto {
  @ApiProperty({ nullable: true })
  header!: string | null;

  @ApiProperty({ nullable: true })
  footer!: string | null;

  @ApiProperty({ nullable: true })
  containerWidth!: string | null;

  @ApiProperty({ nullable: true })
  borderRadius!: string | null;

  @ApiProperty({ nullable: true })
  buttonStyle!: string | null;

  @ApiProperty({ nullable: true })
  homepage!: string | null;

  @ApiProperty({ nullable: true })
  blog!: string | null;
}

/**
 * Rendering-only shape for the public Appearance API — deliberately
 * excludes `status`/`isActive`/`author`/`description`/`thumbnail`/audit
 * fields/`siteId` and every other admin-only field the admin
 * `ThemeResponseDto` exposes. Only `id`/`name`/`slug`/`version` survive as
 * "active theme metadata" (the milestone's own allowed list), everything
 * else is bucketed into `colors`/`typography`/`layout` per the brief's own
 * grouping. `customCss`/`customJs` are included despite not being named
 * individually in the brief's "Returns only" list — they're theme
 * presentation data the public site needs to actually render the theme,
 * not admin-only information, and omitting them would make the Custom
 * CSS/JS appearance settings pointless to have built.
 */
export class PublicThemeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ nullable: true })
  version!: string | null;

  @ApiProperty({ nullable: true })
  logo!: string | null;

  @ApiProperty({ nullable: true })
  favicon!: string | null;

  @ApiProperty({ type: PublicThemeColorsDto })
  colors!: PublicThemeColorsDto;

  @ApiProperty({ type: Object, nullable: true })
  typography!: Record<string, unknown> | null;

  @ApiProperty({ type: PublicThemeLayoutDto })
  layout!: PublicThemeLayoutDto;

  @ApiProperty({ nullable: true })
  customCss!: string | null;

  @ApiProperty({ nullable: true })
  customJs!: string | null;
}
