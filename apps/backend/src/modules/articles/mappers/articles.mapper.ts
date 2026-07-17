import { Injectable } from '@nestjs/common';
import { ArticleRevision, SeoMeta } from '@prisma/client';
import { ArticleWithRelations } from '../repositories/articles.repository';
import { ArticleResponseDto } from '../dto/article-response.dto';
import { ArticleSeoDto } from '../dto/article-seo.dto';
import {
  ArticleRevisionMetadataDto,
  ArticleRevisionResponseDto,
} from '../dto/article-revision-response.dto';
import { computeWordCount } from '../utils/word-count.util';

@Injectable()
export class ArticlesMapper {
  private toSeoDto(seoMeta: SeoMeta | null): ArticleSeoDto | null {
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

  toResponseDto(article: ArticleWithRelations): ArticleResponseDto {
    return {
      id: article.id,
      title: article.title,
      subtitle: article.subtitle,
      slug: article.slug,
      summary: article.summary,
      body: article.body,
      status: article.status,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      scheduledAt: article.scheduledAt?.toISOString() ?? null,
      visibility: article.visibility,
      language: article.language,
      locale: article.locale,
      canonicalUrl: article.canonicalUrl,
      readingTime: article.readingTime,
      wordCount: article.wordCount,
      notes: article.notes,
      featuredMediaId: article.featuredMediaId,
      author: {
        id: article.author.id,
        penName: article.author.penName,
        userId: article.author.userId,
      },
      category: article.primaryCategory
        ? {
            id: article.primaryCategory.id,
            name: article.primaryCategory.name,
            slug: article.primaryCategory.slug,
          }
        : null,
      tags: article.tags.map((articleTag) => ({
        id: articleTag.tag.id,
        name: articleTag.tag.name,
        slug: articleTag.tag.slug,
        primary: articleTag.primary,
      })),
      seo: this.toSeoDto(article.seoMeta),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      deletedAt: article.deletedAt?.toISOString() ?? null,
    };
  }

  toRevisionResponseDto(revision: ArticleRevision): ArticleRevisionResponseDto {
    return {
      version: revision.version,
      title: revision.title,
      summary: revision.summary,
      body: revision.body,
      status: revision.status,
      authorId: revision.authorId,
      comment: revision.comment,
      createdAt: revision.createdAt.toISOString(),
    };
  }

  toRevisionMetadataDto(revision: ArticleRevision): ArticleRevisionMetadataDto {
    return {
      version: revision.version,
      title: revision.title,
      summary: revision.summary,
      status: revision.status,
      authorId: revision.authorId,
      wordCount: computeWordCount(revision.body),
      createdAt: revision.createdAt.toISOString(),
      comment: revision.comment,
    };
  }
}
