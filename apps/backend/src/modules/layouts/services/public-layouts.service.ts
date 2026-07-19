import { BadRequestException, Injectable } from '@nestjs/common';
import { LayoutAssignmentContentType } from '@prisma/client';
import {
  LayoutAssignmentsRepository,
  AssignmentTarget,
} from '../repositories/layout-assignments.repository';
import { PublicLayoutResolutionResponseDto } from '../dto/public-layout-resolution-response.dto';
import { PublicLayoutContentType } from '../constants/public-layout-content-type';
import { PublicPagesService } from '../../pages/services/public-pages.service';
import { PublicArticlesService } from '../../articles/services/public-articles.service';
import { PublicCategoriesService } from '../../categories/services/public-categories.service';

const CONTENT_TYPE_MAP: Record<PublicLayoutContentType, LayoutAssignmentContentType> = {
  home: 'HOMEPAGE',
  page: 'PAGE',
  article: 'ARTICLE',
  category: 'CATEGORY',
};

/**
 * Public Layout resolution (Milestone 14.1) — resolves the two DB-backed
 * tiers of `LayoutResolver`'s 4-tier priority chain (explicit assignment,
 * content default; theme default and system default are resolved
 * entirely on the frontend from data it already has — see
 * docs/78_LAYOUT_ENGINE.md "Resolution Flow"). Mirrors
 * `PublicSeoService`'s composition shape exactly: resolves `slug -> id`
 * via the matching `Public*Service.resolvePublishedIdBySlug()`
 * (Pages/Articles/Categories) — reusing the exact same
 * published/active/public-visibility gate those services already
 * enforce, never re-implementing it. `home` has no slug (one homepage per
 * site).
 */
@Injectable()
export class PublicLayoutsService {
  constructor(
    private readonly repository: LayoutAssignmentsRepository,
    private readonly publicPagesService: PublicPagesService,
    private readonly publicArticlesService: PublicArticlesService,
    private readonly publicCategoriesService: PublicCategoriesService
  ) {}

  private async resolveEntityId(
    contentType: PublicLayoutContentType,
    slug: string | undefined
  ): Promise<string | null> {
    if (contentType === 'home') return null;

    if (!slug) {
      throw new BadRequestException(`"slug" is required when contentType is "${contentType}".`);
    }

    switch (contentType) {
      case 'page':
        return this.publicPagesService.resolvePublishedIdBySlug(slug);
      case 'article':
        return this.publicArticlesService.resolvePublishedIdBySlug(slug);
      case 'category':
        return this.publicCategoriesService.resolvePublishedIdBySlug(slug);
      default: {
        const exhaustiveCheck: never = contentType;
        throw new BadRequestException(
          `Unsupported layout content type: ${String(exhaustiveCheck)}`
        );
      }
    }
  }

  private buildTarget(
    entityContentType: LayoutAssignmentContentType,
    entityId: string | null
  ): AssignmentTarget {
    return {
      contentType: entityContentType,
      pageId: entityContentType === 'PAGE' ? entityId : null,
      articleId: entityContentType === 'ARTICLE' ? entityId : null,
      categoryId: entityContentType === 'CATEGORY' ? entityId : null,
    };
  }

  async resolveLayoutForContent(
    contentType: PublicLayoutContentType,
    slug: string | undefined
  ): Promise<PublicLayoutResolutionResponseDto> {
    const entityContentType = CONTENT_TYPE_MAP[contentType];
    const entityId = await this.resolveEntityId(contentType, slug);
    const site = await this.repository.getDefaultSite();

    const contentDefaultTarget = this.buildTarget(entityContentType, null);

    // HOMEPAGE has no per-instance entity — its one possible assignment
    // IS the content-default target (see `LayoutAssignment`'s Prisma doc
    // comment), so both tiers resolve from a single query.
    if (contentType === 'home') {
      const assignment = await this.repository.findPublishedByTarget(site.id, contentDefaultTarget);
      const layoutPreset = assignment?.layout.layoutPreset ?? null;
      return { explicitLayoutPreset: layoutPreset, contentDefaultLayoutPreset: layoutPreset };
    }

    const explicitTarget = this.buildTarget(entityContentType, entityId);
    const [explicitAssignment, contentDefaultAssignment] = await Promise.all([
      this.repository.findPublishedByTarget(site.id, explicitTarget),
      this.repository.findPublishedByTarget(site.id, contentDefaultTarget),
    ]);

    return {
      explicitLayoutPreset: explicitAssignment?.layout.layoutPreset ?? null,
      contentDefaultLayoutPreset: contentDefaultAssignment?.layout.layoutPreset ?? null,
    };
  }
}
