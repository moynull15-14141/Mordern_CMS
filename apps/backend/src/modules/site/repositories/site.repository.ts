import { Injectable } from '@nestjs/common';
import { Site } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

/**
 * No shared "Sites repository" exists anywhere in this codebase — every
 * content module (`PagesRepository`, `ArticlesRepository`,
 * `CategoriesRepository`, `MenusRepository`) already carries its own
 * private copy of this exact `getDefaultSite()` query (V1 is single-site,
 * `40_PRODUCT_PHILOSOPHY.md` Principle 6 — see any of those repositories'
 * own doc comment for the same reasoning). This is one more copy of that
 * same established convention, not a new pattern, scoped to the new
 * `SiteModule` (Milestone 13.2).
 */
@Injectable()
export class SiteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDefaultSite(): Promise<Site> {
    const site = await this.prisma.site.findFirst({ where: { deletedAt: null } });
    if (!site) {
      throw new Error(
        'No active Site exists — the platform must be seeded with at least one Site.'
      );
    }
    return site;
  }
}
