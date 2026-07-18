import { Injectable } from '@nestjs/common';
import { Prisma, Theme, ThemeStatus } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { generateSlugFromTitle, normalizeSlug, uniquifySlug } from '../../articles/utils/slug.util';
import { ThemesRepository } from '../repositories/themes.repository';
import { ThemesValidator } from '../validators/themes.validator';
import { ThemesMapper } from '../mappers/themes.mapper';
import { SLUG_MAX_UNIQUENESS_ATTEMPTS } from '../constants/theme.constants';
import { ThemeQueryOptions } from '../interfaces/theme-query.interface';
import { CreateThemeDto } from '../dto/create-theme.dto';
import { UpdateThemeDto } from '../dto/update-theme.dto';
import { ThemeResponseDto } from '../dto/theme-response.dto';
import {
  NoActiveThemeException,
  ThemeAlreadyDeletedException,
  ThemeDeletedCannotActivateException,
  ThemeNotDeletedException,
  ThemeNotFoundException,
  ThemeSlugConflictException,
} from '../exceptions/theme.exceptions';

interface ActingUser {
  id: string;
}

/**
 * Themes backend module (Backend Milestone 12). Mirrors `PagesService`'s
 * shape for CRUD/soft-delete/restore, plus an `activate` flow mirroring
 * `MenusRepository.activate`'s "deactivate-then-activate in one
 * transaction" reasoning — applied here at the repository layer directly
 * since deactivating every other theme is a single set-based update, not
 * a per-row loop the service needs to orchestrate. See
 * docs/72_BACKEND_THEMES.md.
 */
@Injectable()
export class ThemesService {
  constructor(
    private readonly repository: ThemesRepository,
    private readonly validator: ThemesValidator,
    private readonly mapper: ThemesMapper,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getThemeOrThrow(id: string, includeDeleted = false): Promise<Theme> {
    const theme = await this.repository.findById(id, includeDeleted);
    if (!theme) {
      throw new ThemeNotFoundException(id);
    }
    return theme;
  }

  private async resolveUniqueSlug(
    requestedSlug: string | undefined,
    name: string,
    siteId: string,
    excludeId?: string
  ): Promise<string> {
    const isTaken = async (candidate: string) =>
      Boolean(await this.repository.findBySlug(candidate, siteId, excludeId));

    if (requestedSlug) {
      const normalized = normalizeSlug(requestedSlug);
      this.validator.validateSlugShape(normalized);
      if (await isTaken(normalized)) {
        throw new ThemeSlugConflictException(normalized);
      }
      return normalized;
    }

    const base = generateSlugFromTitle(name);
    this.validator.validateSlugShape(base);
    return uniquifySlug(base, isTaken, SLUG_MAX_UNIQUENESS_ATTEMPTS);
  }

  async createTheme(dto: CreateThemeDto, actor: ActingUser): Promise<ThemeResponseDto> {
    const site = await this.repository.getDefaultSite();
    const slug = await this.resolveUniqueSlug(dto.slug, dto.name, site.id);

    const created = await this.repository.create({
      site: { connect: { id: site.id } },
      name: dto.name,
      slug,
      version: dto.version,
      author: dto.author,
      description: dto.description,
      thumbnail: dto.thumbnail,
      settings: dto.settings as Prisma.InputJsonValue | undefined,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'theme.create',
      resource: 'theme',
      resourceId: created.id,
      result: 'success',
    });

    return this.mapper.toResponseDto(created);
  }

  async getTheme(id: string): Promise<ThemeResponseDto> {
    return this.mapper.toResponseDto(await this.getThemeOrThrow(id));
  }

  /** `GET /themes/active` — the site's currently-live theme. No fallback
   * to a "default" theme: this milestone's THEME DATA fields don't
   * include a distinct `isDefault` flag, only `isActive`, so "no active
   * theme" is a real, honestly-reported state (`NoActiveThemeException`),
   * not silently backfilled with a guessed default (see
   * docs/72_BACKEND_THEMES.md "Known Limitations"). */
  async getActiveTheme(): Promise<ThemeResponseDto> {
    const site = await this.repository.getDefaultSite();
    const theme = await this.repository.findActive(site.id);
    if (!theme) {
      throw new NoActiveThemeException();
    }
    return this.mapper.toResponseDto(theme);
  }

  async listThemes(options: ThemeQueryOptions): Promise<PaginatedResult<ThemeResponseDto>> {
    const site = await this.repository.getDefaultSite();
    const { items, total } = await this.repository.findMany(site.id, options);
    return buildPaginatedResult(
      items.map((item) => this.mapper.toResponseDto(item)),
      options.page,
      options.limit,
      total
    );
  }

  async updateTheme(id: string, dto: UpdateThemeDto, actor: ActingUser): Promise<ThemeResponseDto> {
    const existing = await this.getThemeOrThrow(id);
    const site = await this.repository.getDefaultSite();
    const slug =
      dto.slug !== undefined && dto.slug !== existing.slug
        ? await this.resolveUniqueSlug(dto.slug, dto.name ?? existing.name, site.id, id)
        : undefined;

    const updated = await this.repository.update(id, {
      name: dto.name,
      slug,
      version: dto.version,
      author: dto.author,
      description: dto.description,
      thumbnail: dto.thumbnail,
      status: dto.status as ThemeStatus | undefined,
      settings: dto.settings as Prisma.InputJsonValue | undefined,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'theme.update',
      resource: 'theme',
      resourceId: id,
      result: 'success',
    });

    return this.mapper.toResponseDto(updated);
  }

  async deleteTheme(id: string, actor: ActingUser): Promise<ThemeResponseDto> {
    const existing = await this.getThemeOrThrow(id);
    if (existing.deletedAt) {
      throw new ThemeAlreadyDeletedException(id);
    }
    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'theme.delete',
      resource: 'theme',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getThemeOrThrow(id, true));
  }

  async restoreTheme(id: string, actor: ActingUser): Promise<ThemeResponseDto> {
    const existing = await this.getThemeOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new ThemeNotDeletedException(id);
    }
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'theme.restore',
      resource: 'theme',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getThemeOrThrow(id));
  }

  /** "Only one active theme per Site. Activation must automatically
   * deactivate the previous one. Reject activating deleted themes." — all
   * three rules from the brief. The deleted-theme check uses
   * `includeDeleted: true` deliberately (not the default
   * `getThemeOrThrow`), so activating a deleted theme gets its own
   * specific `ThemeDeletedCannotActivateException` instead of a generic
   * `ThemeNotFoundException` that would look like a typo'd id. */
  async activateTheme(id: string, actor: ActingUser): Promise<ThemeResponseDto> {
    const theme = await this.repository.findById(id, true);
    if (!theme) {
      throw new ThemeNotFoundException(id);
    }
    if (theme.deletedAt) {
      throw new ThemeDeletedCannotActivateException(id);
    }

    const activated = await this.repository.activate(id, theme.siteId, actor.id);

    this.auditLogger.record({
      actorId: actor.id,
      action: 'theme.activate',
      resource: 'theme',
      resourceId: id,
      result: 'success',
    });

    return this.mapper.toResponseDto(activated);
  }
}
