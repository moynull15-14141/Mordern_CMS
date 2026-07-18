import { Injectable } from '@nestjs/common';
import { SeoMeta } from '@prisma/client';
import { PageWithRelations } from '../repositories/pages.repository';
import { PageResponseDto } from '../dto/page-response.dto';
import { PageSeoDto } from '../dto/page-seo.dto';

@Injectable()
export class PagesMapper {
  private toSeoDto(seoMeta: SeoMeta | null): PageSeoDto | null {
    if (!seoMeta) return null;
    return {
      title: seoMeta.title ?? undefined,
      description: seoMeta.description ?? undefined,
      canonicalUrl: seoMeta.canonicalUrl ?? undefined,
      keywords: seoMeta.keywords,
      openGraph: (seoMeta.openGraph as Record<string, unknown>) ?? undefined,
      twitterCard: (seoMeta.twitterCard as Record<string, unknown>) ?? undefined,
      schemaJson: (seoMeta.schemaJson as Record<string, unknown>) ?? undefined,
      robots: (seoMeta.robots as Record<string, unknown>) ?? undefined,
      extraMeta: (seoMeta.extraMeta as Record<string, unknown>) ?? undefined,
    };
  }

  toResponseDto(page: PageWithRelations): PageResponseDto {
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      body: page.body,
      status: page.status,
      publishedAt: page.publishedAt?.toISOString() ?? null,
      seo: this.toSeoDto(page.seoMeta),
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
      deletedAt: page.deletedAt?.toISOString() ?? null,
    };
  }
}
