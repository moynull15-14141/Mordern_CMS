import { Injectable } from '@nestjs/common';
import { SeoMeta } from '@prisma/client';
import { SeoResponseDto } from '../dto/seo-response.dto';

@Injectable()
export class SeoMapper {
  private prettyPrint(schemaJson: unknown): string | null {
    if (schemaJson === null || schemaJson === undefined) return null;
    try {
      return JSON.stringify(schemaJson, null, 2);
    } catch {
      return null;
    }
  }

  toResponseDto(seoMeta: SeoMeta): SeoResponseDto {
    return {
      id: seoMeta.id,
      siteId: seoMeta.siteId,
      title: seoMeta.title,
      description: seoMeta.description,
      keywords: seoMeta.keywords,
      canonicalUrl: seoMeta.canonicalUrl,
      openGraph: (seoMeta.openGraph as Record<string, unknown> | null) ?? null,
      twitterCard: (seoMeta.twitterCard as Record<string, unknown> | null) ?? null,
      schemaJson: (seoMeta.schemaJson as Record<string, unknown> | null) ?? null,
      robots: (seoMeta.robots as Record<string, unknown> | null) ?? null,
      extraMeta: (seoMeta.extraMeta as Record<string, unknown> | null) ?? null,
      schemaJsonPretty: this.prettyPrint(seoMeta.schemaJson),
      createdAt: seoMeta.createdAt.toISOString(),
      updatedAt: seoMeta.updatedAt.toISOString(),
      deletedAt: seoMeta.deletedAt?.toISOString() ?? null,
    };
  }
}
