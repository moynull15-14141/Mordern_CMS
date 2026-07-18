import { Injectable } from '@nestjs/common';
import { Theme } from '@prisma/client';
import { ThemeResponseDto } from '../dto/theme-response.dto';
import { ThemeSettingsDto } from '../dto/theme-settings.dto';
import { PublicThemeResponseDto } from '../dto/public-theme-response.dto';

@Injectable()
export class ThemesMapper {
  private toSettingsDto(settings: Theme['settings']): ThemeSettingsDto | null {
    if (!settings || typeof settings !== 'object') return null;
    return settings as ThemeSettingsDto;
  }

  toResponseDto(theme: Theme): ThemeResponseDto {
    return {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      version: theme.version,
      author: theme.author,
      description: theme.description,
      thumbnail: theme.thumbnail,
      status: theme.status,
      isActive: theme.isActive,
      settings: this.toSettingsDto(theme.settings),
      createdAt: theme.createdAt.toISOString(),
      updatedAt: theme.updatedAt.toISOString(),
      deletedAt: theme.deletedAt?.toISOString() ?? null,
    };
  }

  /** Public read path — buckets the flat `ThemeSettingsDto` fields into
   * `colors`/`layout` per the milestone's own grouping, excludes every
   * admin-only field (status/isActive/author/description/thumbnail/audit/
   * siteId). Built explicitly, field-by-field — this project's
   * `ResponseInterceptor` does not strip fields based on DTO class
   * decorators, so the mapper is the actual security boundary here (same
   * reasoning `MenusMapper.toPublicResponseDto` documents). */
  toPublicResponseDto(theme: Theme): PublicThemeResponseDto {
    const settings = this.toSettingsDto(theme.settings) ?? ({} as ThemeSettingsDto);

    return {
      id: theme.id,
      name: theme.name,
      slug: theme.slug,
      version: theme.version,
      logo: settings.logo ?? null,
      favicon: settings.favicon ?? null,
      colors: {
        primary: settings.primaryColor ?? null,
        secondary: settings.secondaryColor ?? null,
      },
      typography: settings.typography ?? null,
      layout: {
        header: settings.headerLayout ?? null,
        footer: settings.footerLayout ?? null,
        containerWidth: settings.containerWidth ?? null,
        borderRadius: settings.borderRadius ?? null,
        buttonStyle: settings.buttonStyle ?? null,
        homepage: settings.homepageLayout ?? null,
        blog: settings.blogLayout ?? null,
      },
      customCss: settings.customCss ?? null,
      customJs: settings.customJs ?? null,
    };
  }
}
