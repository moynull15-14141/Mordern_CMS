import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { SeoRepository } from './seo.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
    article: { findFirst: jest.fn() },
    category: { findFirst: jest.fn() },
    page: { findFirst: jest.fn() },
    seoMeta: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('SeoRepository', () => {
  describe('siteExists', () => {
    it('returns true when an active site is found', async () => {
      const prisma = buildPrismaMock();
      (prisma.site.findFirst as jest.Mock).mockResolvedValue({ id: 'site-1' });
      const repository = new SeoRepository(prisma);
      expect(await repository.siteExists('site-1')).toBe(true);
      expect(prisma.site.findFirst).toHaveBeenCalledWith({
        where: { id: 'site-1', deletedAt: null },
        select: { id: true },
      });
    });

    it('returns false when no site is found', async () => {
      const prisma = buildPrismaMock();
      (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
      const repository = new SeoRepository(prisma);
      expect(await repository.siteExists('missing')).toBe(false);
    });
  });

  describe('findById', () => {
    it('excludes soft-deleted by default', async () => {
      const prisma = buildPrismaMock();
      const repository = new SeoRepository(prisma);
      await repository.findById('seo-1');
      expect(prisma.seoMeta.findFirst).toHaveBeenCalledWith({
        where: { id: 'seo-1', deletedAt: null },
      });
    });

    it('includes soft-deleted when requested', async () => {
      const prisma = buildPrismaMock();
      const repository = new SeoRepository(prisma);
      await repository.findById('seo-1', true);
      expect(prisma.seoMeta.findFirst).toHaveBeenCalledWith({ where: { id: 'seo-1' } });
    });
  });

  describe('exists', () => {
    it('returns true when an active row is found', async () => {
      const prisma = buildPrismaMock();
      (prisma.seoMeta.findFirst as jest.Mock).mockResolvedValue({ id: 'seo-1' });
      const repository = new SeoRepository(prisma);
      expect(await repository.exists('seo-1')).toBe(true);
    });

    it('returns false when no row is found', async () => {
      const prisma = buildPrismaMock();
      (prisma.seoMeta.findFirst as jest.Mock).mockResolvedValue(null);
      const repository = new SeoRepository(prisma);
      expect(await repository.exists('missing')).toBe(false);
    });
  });

  describe('create / update', () => {
    it('create delegates straight through to prisma', async () => {
      const prisma = buildPrismaMock();
      const repository = new SeoRepository(prisma);
      const data = { title: 'x' } as never;
      await repository.create(data);
      expect(prisma.seoMeta.create).toHaveBeenCalledWith({ data });
    });

    it('update delegates straight through to prisma', async () => {
      const prisma = buildPrismaMock();
      const repository = new SeoRepository(prisma);
      const data = { title: 'edited' } as never;
      await repository.update('seo-1', data);
      expect(prisma.seoMeta.update).toHaveBeenCalledWith({ where: { id: 'seo-1' }, data });
    });
  });

  describe('softDelete / restore', () => {
    it('softDelete sets deletedAt/deletedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new SeoRepository(prisma);
      await repository.softDelete('seo-1', 'actor-1');
      expect(prisma.seoMeta.update).toHaveBeenCalledWith({
        where: { id: 'seo-1' },
        data: { deletedAt: expect.any(Date), deletedBy: 'actor-1' },
      });
    });

    it('restore clears deletedAt/deletedBy and sets updatedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new SeoRepository(prisma);
      await repository.restore('seo-1', 'actor-1');
      expect(prisma.seoMeta.update).toHaveBeenCalledWith({
        where: { id: 'seo-1' },
        data: { deletedAt: null, deletedBy: null, updatedBy: 'actor-1' },
      });
    });
  });

  describe('findArticleSeoMetaId', () => {
    it('returns found=true and the seoMetaId when the article exists', async () => {
      const prisma = buildPrismaMock();
      (prisma.article.findFirst as jest.Mock).mockResolvedValue({ seoMetaId: 'seo-1' });
      const repository = new SeoRepository(prisma);
      expect(await repository.findArticleSeoMetaId('article-1')).toEqual({
        found: true,
        seoMetaId: 'seo-1',
      });
      expect(prisma.article.findFirst).toHaveBeenCalledWith({
        where: { id: 'article-1', deletedAt: null },
        select: { seoMetaId: true },
      });
    });

    it('returns found=true and seoMetaId=null when the article has no linked SEO', async () => {
      const prisma = buildPrismaMock();
      (prisma.article.findFirst as jest.Mock).mockResolvedValue({ seoMetaId: null });
      const repository = new SeoRepository(prisma);
      expect(await repository.findArticleSeoMetaId('article-1')).toEqual({
        found: true,
        seoMetaId: null,
      });
    });

    it('returns found=false when the article does not exist', async () => {
      const prisma = buildPrismaMock();
      (prisma.article.findFirst as jest.Mock).mockResolvedValue(null);
      const repository = new SeoRepository(prisma);
      expect(await repository.findArticleSeoMetaId('missing')).toEqual({
        found: false,
        seoMetaId: null,
      });
    });
  });

  describe('findCategorySeoMetaId', () => {
    it('returns found=true and the seoMetaId when the category exists', async () => {
      const prisma = buildPrismaMock();
      (prisma.category.findFirst as jest.Mock).mockResolvedValue({ seoMetaId: 'seo-2' });
      const repository = new SeoRepository(prisma);
      expect(await repository.findCategorySeoMetaId('category-1')).toEqual({
        found: true,
        seoMetaId: 'seo-2',
      });
    });

    it('returns found=false when the category does not exist', async () => {
      const prisma = buildPrismaMock();
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);
      const repository = new SeoRepository(prisma);
      expect(await repository.findCategorySeoMetaId('missing')).toEqual({
        found: false,
        seoMetaId: null,
      });
    });
  });

  describe('findPageSeoMetaId', () => {
    it('returns found=true and the seoMetaId when the page exists', async () => {
      const prisma = buildPrismaMock();
      (prisma.page.findFirst as jest.Mock).mockResolvedValue({ seoMetaId: 'seo-3' });
      const repository = new SeoRepository(prisma);
      expect(await repository.findPageSeoMetaId('page-1')).toEqual({
        found: true,
        seoMetaId: 'seo-3',
      });
    });

    it('returns found=false when the page does not exist', async () => {
      const prisma = buildPrismaMock();
      (prisma.page.findFirst as jest.Mock).mockResolvedValue(null);
      const repository = new SeoRepository(prisma);
      expect(await repository.findPageSeoMetaId('missing')).toEqual({
        found: false,
        seoMetaId: null,
      });
    });
  });
});
