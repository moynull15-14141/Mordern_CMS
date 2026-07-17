import { Injectable } from '@nestjs/common';
import { Category, SeoMeta } from '@prisma/client';
import { CategoryTreeNode } from '../interfaces/category-tree-node.interface';
import { CategoryResponseDto, CategoryTreeNodeResponseDto } from '../dto/category-response.dto';
import { CategorySeoDto } from '../dto/category-seo.dto';

export interface CategoryMapperContext {
  articleCount: number;
  childrenCount: number;
  seoMeta: SeoMeta | null;
}

@Injectable()
export class CategoriesMapper {
  private toSeoDto(seoMeta: SeoMeta | null): CategorySeoDto | null {
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

  toResponseDto(category: Category, context: CategoryMapperContext): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status,
      parentId: category.parentId,
      sortOrder: category.sortOrder,
      articleCount: context.articleCount,
      childrenCount: context.childrenCount,
      seo: this.toSeoDto(context.seoMeta),
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
      deletedAt: category.deletedAt?.toISOString() ?? null,
    };
  }

  /** Tree nodes are built without SEO/count context (a full tree walk would
   * otherwise require N extra queries) — `articleCount`/`childrenCount` are
   * populated as `0` placeholders here; callers that need exact counts on
   * every node should fetch individual categories via getCategory() instead. */
  toTreeNodeDto(node: CategoryTreeNode): CategoryTreeNodeResponseDto {
    return {
      id: node.id,
      name: node.name,
      slug: node.slug,
      description: node.description,
      status: node.status,
      parentId: node.parentId,
      sortOrder: node.sortOrder,
      articleCount: 0,
      childrenCount: node.children.length,
      seo: null,
      createdAt: node.createdAt.toISOString(),
      updatedAt: node.updatedAt.toISOString(),
      deletedAt: node.deletedAt?.toISOString() ?? null,
      children: node.children.map((child) => this.toTreeNodeDto(child)),
    };
  }
}
