import { Injectable } from '@nestjs/common';
import { ArticleResponseDto } from '../dto/article-response.dto';
import {
  PublicArticleListItemDto,
  PublicArticleResponseDto,
  PublicArticleSeoDto,
} from '../dto/public-article-response.dto';

/**
 * Trims the existing (admin-shaped) `ArticleResponseDto` — already
 * produced by the real, reused `ArticlesService` — down to the public
 * shapes. No new query, no new business logic.
 */
@Injectable()
export class PublicArticlesMapper {
  private toSeoDto(seo: ArticleResponseDto['seo']): PublicArticleSeoDto | null {
    if (!seo) return null;
    return {
      title: seo.title,
      description: seo.description,
      canonicalUrl: seo.canonicalUrl,
      keywords: seo.keywords,
      openGraph: seo.openGraph,
      twitterCard: seo.twitterCard,
      schemaJson: seo.schemaJson,
      robots: seo.robots,
    };
  }

  toListItemDto(article: ArticleResponseDto): PublicArticleListItemDto {
    return {
      title: article.title,
      subtitle: article.subtitle,
      slug: article.slug,
      summary: article.summary,
      publishedAt: article.publishedAt,
      readingTime: article.readingTime,
      author: { penName: article.author.penName },
      category: article.category
        ? { name: article.category.name, slug: article.category.slug }
        : null,
      tags: article.tags.map((tag) => ({ name: tag.name, slug: tag.slug, primary: tag.primary })),
    };
  }

  toPublicResponseDto(article: ArticleResponseDto): PublicArticleResponseDto {
    return {
      ...this.toListItemDto(article),
      body: article.body,
      wordCount: article.wordCount,
      language: article.language,
      locale: article.locale,
      canonicalUrl: article.canonicalUrl,
      seo: this.toSeoDto(article.seo),
    };
  }
}
