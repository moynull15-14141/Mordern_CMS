import { Injectable } from '@nestjs/common';
import { Prisma, SeoMeta } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { SettingsService } from '../../settings/services/settings.service';
import { SettingCategory } from '../../settings/enums/setting-category.enum';
import { buildSettingKey } from '../../settings/interfaces/setting-definition.interface';
import { SeoRepository } from '../repositories/seo.repository';
import { SeoValidator } from '../validators/seo.validator';
import { SeoMapper } from '../mappers/seo.mapper';
import { CreateSeoDto } from '../dto/create-seo.dto';
import { UpdateSeoDto } from '../dto/update-seo.dto';
import { UpsertSeoDto } from '../dto/upsert-seo.dto';
import { SeoResponseDto } from '../dto/seo-response.dto';
import { SeoPreviewDto, SeoPreviewRequestDto } from '../dto/seo-preview.dto';
import {
  SeoValidateRequestDto,
  SeoValidationDto,
  SeoValidationErrorDto,
} from '../dto/seo-validation.dto';
import { analyzeSeo } from '../utils/seo-analysis.util';
import {
  SeoArticleNotFoundException,
  SeoCategoryNotFoundException,
  SeoMetaAlreadyDeletedException,
  SeoMetaNotDeletedException,
  SeoMetaNotFoundException,
  SeoMetaNotLinkedException,
  SeoPageNotFoundException,
  SeoSiteNotFoundException,
  SeoValidationException,
} from '../exceptions/seo.exceptions';

interface ActingUser {
  id: string;
}

@Injectable()
export class SeoService {
  constructor(
    private readonly repository: SeoRepository,
    private readonly validator: SeoValidator,
    private readonly mapper: SeoMapper,
    private readonly settingsService: SettingsService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getSeoMetaOrThrow(id: string, includeDeleted = false): Promise<SeoMeta> {
    const seoMeta = await this.repository.findById(id, includeDeleted);
    if (!seoMeta) {
      throw new SeoMetaNotFoundException(id);
    }
    return seoMeta;
  }

  /** Validates every field present in a candidate payload, normalizing
   * `canonicalUrl` in place. Shared by create/update/upsert/validate so
   * the exact same rules apply everywhere a `SeoMeta` row could be
   * written — the milestone brief's "Validation" list, applied uniformly. */
  private validateFields<
    T extends { title?: string; description?: string; keywords?: string[]; canonicalUrl?: string },
  >(dto: T): T {
    const title = this.validator.assertTitle(dto.title);
    const description = this.validator.assertDescription(dto.description);
    const keywords = this.validator.assertKeywords(dto.keywords);
    const canonicalUrl = this.validator.assertCanonicalUrl(dto.canonicalUrl);
    this.validator.assertOpenGraph(
      (dto as unknown as { openGraph?: Record<string, unknown> }).openGraph
    );
    this.validator.assertTwitterCard(
      (dto as unknown as { twitterCard?: Record<string, unknown> }).twitterCard
    );
    this.validator.assertRobots((dto as unknown as { robots?: Record<string, unknown> }).robots);
    this.validator.assertJsonLd(
      (dto as unknown as { schemaJson?: Record<string, unknown> }).schemaJson
    );

    return {
      ...dto,
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(keywords !== undefined ? { keywords } : {}),
      ...(canonicalUrl !== undefined ? { canonicalUrl } : {}),
    };
  }

  async createSeo(dto: CreateSeoDto, actor: ActingUser): Promise<SeoResponseDto> {
    const siteExists = await this.repository.siteExists(dto.siteId);
    if (!siteExists) {
      throw new SeoSiteNotFoundException(dto.siteId);
    }
    const validated = this.validateFields(dto);

    const created = await this.repository.create({
      site: { connect: { id: validated.siteId } },
      title: validated.title,
      description: validated.description,
      keywords: validated.keywords ?? [],
      canonicalUrl: validated.canonicalUrl,
      openGraph: (validated.openGraph as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      twitterCard: (validated.twitterCard as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      schemaJson: (validated.schemaJson as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      robots: (validated.robots as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      extraMeta: (validated.extraMeta as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'seo.create',
      resource: 'seo_meta',
      resourceId: created.id,
      result: 'success',
    });
    return this.mapper.toResponseDto(created);
  }

  async getSeo(id: string): Promise<SeoResponseDto> {
    const seoMeta = await this.getSeoMetaOrThrow(id);
    return this.mapper.toResponseDto(seoMeta);
  }

  async updateSeo(id: string, dto: UpdateSeoDto, actor: ActingUser): Promise<SeoResponseDto> {
    await this.getSeoMetaOrThrow(id);
    const validated = this.validateFields(dto);

    const updated = await this.repository.update(id, {
      ...(validated.title !== undefined ? { title: validated.title } : {}),
      ...(validated.description !== undefined ? { description: validated.description } : {}),
      ...(validated.keywords !== undefined ? { keywords: validated.keywords } : {}),
      ...(validated.canonicalUrl !== undefined ? { canonicalUrl: validated.canonicalUrl } : {}),
      ...(validated.openGraph !== undefined
        ? { openGraph: validated.openGraph as Prisma.InputJsonValue }
        : {}),
      ...(validated.twitterCard !== undefined
        ? { twitterCard: validated.twitterCard as Prisma.InputJsonValue }
        : {}),
      ...(validated.schemaJson !== undefined
        ? { schemaJson: validated.schemaJson as Prisma.InputJsonValue }
        : {}),
      ...(validated.robots !== undefined
        ? { robots: validated.robots as Prisma.InputJsonValue }
        : {}),
      ...(validated.extraMeta !== undefined
        ? { extraMeta: validated.extraMeta as Prisma.InputJsonValue }
        : {}),
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'seo.update',
      resource: 'seo_meta',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(updated);
  }

  async deleteSeo(id: string, actor: ActingUser): Promise<SeoResponseDto> {
    const existing = await this.getSeoMetaOrThrow(id);
    if (existing.deletedAt) {
      throw new SeoMetaAlreadyDeletedException(id);
    }
    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'seo.delete',
      resource: 'seo_meta',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getSeoMetaOrThrow(id, true));
  }

  async restoreSeo(id: string, actor: ActingUser): Promise<SeoResponseDto> {
    const existing = await this.getSeoMetaOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new SeoMetaNotDeletedException(id);
    }
    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'seo.restore',
      resource: 'seo_meta',
      resourceId: id,
      result: 'success',
    });
    return this.mapper.toResponseDto(await this.getSeoMetaOrThrow(id));
  }

  async upsertSeo(dto: UpsertSeoDto, actor: ActingUser): Promise<SeoResponseDto> {
    if (dto.id) {
      const existing = await this.repository.findById(dto.id);
      if (existing) {
        const { id, siteId: _siteId, ...updateFields } = dto;
        void _siteId;
        return this.updateSeo(id, updateFields, actor);
      }
    }
    const { id: _id, ...createFields } = dto;
    void _id;
    return this.createSeo(createFields, actor);
  }

  async previewSeo(dto: SeoPreviewRequestDto): Promise<SeoPreviewDto> {
    const validated = this.validateFields(dto);

    const [defaultTitleSetting, defaultDescriptionSetting] = await Promise.all([
      this.settingsService.getByKey(buildSettingKey(SettingCategory.SEO, 'defaultMetaTitle')),
      this.settingsService.getByKey(buildSettingKey(SettingCategory.SEO, 'defaultMetaDescription')),
    ]);

    const fallbackTitle =
      typeof defaultTitleSetting.value === 'string' && defaultTitleSetting.value.length > 0
        ? defaultTitleSetting.value
        : null;
    const fallbackDescription =
      typeof defaultDescriptionSetting.value === 'string' &&
      defaultDescriptionSetting.value.length > 0
        ? defaultDescriptionSetting.value
        : null;

    const openGraph = (validated.openGraph as Record<string, unknown> | undefined) ?? null;
    const twitterCard = (validated.twitterCard as Record<string, unknown> | undefined) ?? null;
    const image =
      (typeof openGraph?.image === 'string' ? openGraph.image : null) ??
      (typeof twitterCard?.image === 'string' ? twitterCard.image : null);

    return {
      title: validated.title ?? fallbackTitle,
      description: validated.description ?? fallbackDescription,
      image,
      canonical: validated.canonicalUrl ?? null,
      robots: (validated.robots as Record<string, unknown> | undefined) ?? null,
      openGraph,
      twitterCard,
    };
  }

  async validateSeoInput(dto: SeoValidateRequestDto): Promise<SeoValidationDto> {
    const errors: SeoValidationErrorDto[] = [];
    let robotsValid = true;

    try {
      this.validator.assertTitle(dto.title);
    } catch (error) {
      errors.push({
        field: 'title',
        message: (error as SeoValidationException).message ?? 'Invalid title.',
      });
    }
    try {
      this.validator.assertDescription(dto.description);
    } catch (error) {
      errors.push({
        field: 'description',
        message: (error as SeoValidationException).message ?? 'Invalid description.',
      });
    }
    try {
      this.validator.assertKeywords(dto.keywords);
    } catch (error) {
      errors.push({
        field: 'keywords',
        message: (error as SeoValidationException).message ?? 'Invalid keywords.',
      });
    }
    try {
      this.validator.assertCanonicalUrl(dto.canonicalUrl);
    } catch (error) {
      errors.push({
        field: 'canonicalUrl',
        message: (error as SeoValidationException).message ?? 'Invalid canonical URL.',
      });
    }
    try {
      this.validator.assertOpenGraph(dto.openGraph);
    } catch (error) {
      errors.push({
        field: 'openGraph',
        message: (error as SeoValidationException).message ?? 'Invalid openGraph.',
      });
    }
    try {
      this.validator.assertTwitterCard(dto.twitterCard);
    } catch (error) {
      errors.push({
        field: 'twitterCard',
        message: (error as SeoValidationException).message ?? 'Invalid twitterCard.',
      });
    }
    try {
      this.validator.assertRobots(dto.robots);
    } catch (error) {
      robotsValid = false;
      errors.push({
        field: 'robots',
        message: (error as SeoValidationException).message ?? 'Invalid robots.',
      });
    }
    try {
      this.validator.assertJsonLd(dto.schemaJson);
    } catch (error) {
      errors.push({
        field: 'schemaJson',
        message: (error as SeoValidationException).message ?? 'Invalid schemaJson.',
      });
    }

    const warnings = analyzeSeo({
      title: dto.title,
      description: dto.description,
      canonicalUrl: dto.canonicalUrl,
      openGraph: dto.openGraph,
      twitterCard: dto.twitterCard,
      robotsValid,
    });

    return { valid: errors.length === 0, errors, analysis: { warnings } };
  }

  async getSeoForArticle(articleId: string): Promise<SeoResponseDto> {
    const { found, seoMetaId } = await this.repository.findArticleSeoMetaId(articleId);
    if (!found) {
      throw new SeoArticleNotFoundException(articleId);
    }
    if (!seoMetaId) {
      throw new SeoMetaNotLinkedException('article', articleId);
    }
    return this.getSeo(seoMetaId);
  }

  async getSeoForCategory(categoryId: string): Promise<SeoResponseDto> {
    const { found, seoMetaId } = await this.repository.findCategorySeoMetaId(categoryId);
    if (!found) {
      throw new SeoCategoryNotFoundException(categoryId);
    }
    if (!seoMetaId) {
      throw new SeoMetaNotLinkedException('category', categoryId);
    }
    return this.getSeo(seoMetaId);
  }

  async getSeoForPage(pageId: string): Promise<SeoResponseDto> {
    const { found, seoMetaId } = await this.repository.findPageSeoMetaId(pageId);
    if (!found) {
      throw new SeoPageNotFoundException(pageId);
    }
    if (!seoMetaId) {
      throw new SeoMetaNotLinkedException('page', pageId);
    }
    return this.getSeo(seoMetaId);
  }
}
