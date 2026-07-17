import { ArticleSortField } from '../constants/article.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ArticlesRepository } from './articles.repository';

function buildPrismaMock() {
  const prisma = {
    site: { findFirst: jest.fn() },
    author: { findFirst: jest.fn() },
    category: { findFirst: jest.fn() },
    tag: { findMany: jest.fn() },
    mediaAsset: { findFirst: jest.fn() },
    article: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    articleTag: { deleteMany: jest.fn(), createMany: jest.fn() },
    seoMeta: { create: jest.fn(), update: jest.fn() },
    articleRevision: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn() },
  } as unknown as PrismaService;
  // `$transaction` supports both the array form (used by `setTags`'s
  // standalone path) and the interactive-callback form (used by
  // `ArticlesRepository.transaction()`), matching real Prisma's dual API.
  (prisma as unknown as { $transaction: jest.Mock }).$transaction = jest.fn(
    (arg: unknown[] | ((tx: unknown) => unknown)) =>
      typeof arg === 'function'
        ? (arg as (tx: unknown) => unknown)(prisma)
        : Promise.all(arg as never[])
  );
  return prisma;
}

describe('ArticlesRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new ArticlesRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  it('getDefaultSite returns the first active site', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue({ id: 'site-1' });
    const repository = new ArticlesRepository(prisma);
    const site = await repository.getDefaultSite();
    expect(site).toEqual({ id: 'site-1' });
    expect(prisma.site.findFirst).toHaveBeenCalledWith({ where: { deletedAt: null } });
  });

  it('findTagsByIds returns [] for an empty array without querying', async () => {
    const prisma = buildPrismaMock();
    const repository = new ArticlesRepository(prisma);
    const result = await repository.findTagsByIds([]);
    expect(result).toEqual([]);
    expect(prisma.tag.findMany).not.toHaveBeenCalled();
  });

  it('findBySlug scopes by siteId and excludes soft-deleted rows', async () => {
    const prisma = buildPrismaMock();
    const repository = new ArticlesRepository(prisma);
    await repository.findBySlug('hello-world', 'site-1');
    expect(prisma.article.findFirst).toHaveBeenCalledWith({
      where: { slug: 'hello-world', siteId: 'site-1', deletedAt: null },
    });
  });

  it('findBySlug excludes a given id when checking uniqueness on update', async () => {
    const prisma = buildPrismaMock();
    const repository = new ArticlesRepository(prisma);
    await repository.findBySlug('hello-world', 'site-1', 'article-1');
    expect(prisma.article.findFirst).toHaveBeenCalledWith({
      where: { slug: 'hello-world', siteId: 'site-1', deletedAt: null, id: { not: 'article-1' } },
    });
  });

  it('findMany applies pagination and role-based tag filtering', async () => {
    const prisma = buildPrismaMock();
    const repository = new ArticlesRepository(prisma);
    await repository.findMany('site-1', {
      filters: { tagId: 'tag-1' },
      sortBy: ArticleSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
      page: 2,
      limit: 10,
    });
    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tags: { some: { tagId: 'tag-1' } } }),
        skip: 10,
        take: 10,
      })
    );
  });

  it('setTags replaces the tag set in a transaction', async () => {
    const prisma = buildPrismaMock();
    const repository = new ArticlesRepository(prisma);
    await repository.setTags('article-1', ['tag-1', 'tag-2'], 'tag-1');
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.articleTag.deleteMany).toHaveBeenCalledWith({
      where: { articleId: 'article-1' },
    });
    expect(prisma.articleTag.createMany).toHaveBeenCalledWith({
      data: [
        { articleId: 'article-1', tagId: 'tag-1', primary: true },
        { articleId: 'article-1', tagId: 'tag-2', primary: false },
      ],
    });
  });

  it('setTags with no tags only clears the existing set', async () => {
    const prisma = buildPrismaMock();
    const repository = new ArticlesRepository(prisma);
    await repository.setTags('article-1', []);
    expect(prisma.articleTag.createMany).not.toHaveBeenCalled();
  });

  it('getMaxRevisionVersion returns 0 when no revisions exist', async () => {
    const prisma = buildPrismaMock();
    (prisma.articleRevision.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new ArticlesRepository(prisma);
    expect(await repository.getMaxRevisionVersion('article-1')).toBe(0);
  });

  it('getMaxRevisionVersion returns the latest version', async () => {
    const prisma = buildPrismaMock();
    (prisma.articleRevision.findFirst as jest.Mock).mockResolvedValue({ version: 5 });
    const repository = new ArticlesRepository(prisma);
    expect(await repository.getMaxRevisionVersion('article-1')).toBe(5);
  });

  it('upsertSeoMeta creates a new row (with site connect) when no existing id is given', async () => {
    const prisma = buildPrismaMock();
    (prisma.seoMeta.create as jest.Mock).mockResolvedValue({ id: 'seo-1' });
    const repository = new ArticlesRepository(prisma);
    const id = await repository.upsertSeoMeta(null, 'site-1', { title: 'T' } as never, 'actor-1');
    expect(id).toBe('seo-1');
    expect(prisma.seoMeta.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'T',
        site: { connect: { id: 'site-1' } },
        createdBy: 'actor-1',
      }),
    });
  });

  it('upsertSeoMeta updates the existing row when an id is given', async () => {
    const prisma = buildPrismaMock();
    (prisma.seoMeta.update as jest.Mock).mockResolvedValue({ id: 'seo-1' });
    const repository = new ArticlesRepository(prisma);
    const id = await repository.upsertSeoMeta(
      'seo-1',
      'site-1',
      { title: 'T2' } as never,
      'actor-1'
    );
    expect(id).toBe('seo-1');
    expect(prisma.seoMeta.update).toHaveBeenCalledWith({
      where: { id: 'seo-1' },
      data: expect.objectContaining({ title: 'T2', updatedBy: 'actor-1' }),
    });
    expect(prisma.seoMeta.create).not.toHaveBeenCalled();
  });

  describe('transaction (stabilization patch — Article create atomicity)', () => {
    it('delegates to prisma.$transaction with the callback', async () => {
      const prisma = buildPrismaMock();
      const repository = new ArticlesRepository(prisma);
      const result = await repository.transaction(async () => 'done');
      expect(result).toBe('done');
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('create/setTags/createRevision/getMaxRevisionVersion all run against the tx client when one is passed', async () => {
      const prisma = buildPrismaMock();
      const repository = new ArticlesRepository(prisma);
      const txArticleCreate = jest.fn().mockResolvedValue({ id: 'article-1' });
      const fakeTx = {
        article: { create: txArticleCreate },
        articleTag: { deleteMany: jest.fn(), createMany: jest.fn() },
        articleRevision: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn() },
      } as never;

      await repository.create({ title: 'T' } as never, fakeTx);
      expect(txArticleCreate).toHaveBeenCalled();
      expect(prisma.article.create).not.toHaveBeenCalled();

      await repository.setTags('article-1', ['tag-1'], undefined, fakeTx);
      expect(
        (fakeTx as never as { articleTag: { deleteMany: jest.Mock } }).articleTag.deleteMany
      ).toHaveBeenCalled();
      expect(prisma.articleTag.deleteMany).not.toHaveBeenCalled();

      const version = await repository.getMaxRevisionVersion('article-1', fakeTx);
      expect(version).toBe(0);
      expect(prisma.articleRevision.findFirst).not.toHaveBeenCalled();

      await repository.createRevision({ version: 1 } as never, fakeTx);
      expect(
        (fakeTx as never as { articleRevision: { create: jest.Mock } }).articleRevision.create
      ).toHaveBeenCalled();
      expect(prisma.articleRevision.create).not.toHaveBeenCalled();
    });

    it('setTags falls back to array-form $transaction for atomicity when called standalone (no tx)', async () => {
      const prisma = buildPrismaMock();
      const repository = new ArticlesRepository(prisma);
      await repository.setTags('article-1', ['tag-1']);
      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Array));
      expect(prisma.articleTag.deleteMany).toHaveBeenCalledWith({
        where: { articleId: 'article-1' },
      });
    });
  });
});
