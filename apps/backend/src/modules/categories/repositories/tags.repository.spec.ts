import { TagSortField } from '../constants/category.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { TagsRepository } from './tags.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
    tag: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    articleTag: { count: jest.fn().mockResolvedValue(0) },
  } as unknown as PrismaService;
}

describe('TagsRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new TagsRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  it('findById excludes soft-deleted by default', async () => {
    const prisma = buildPrismaMock();
    const repository = new TagsRepository(prisma);
    await repository.findById('tag-1');
    expect(prisma.tag.findFirst).toHaveBeenCalledWith({ where: { id: 'tag-1', deletedAt: null } });
  });

  it('findById includes soft-deleted when requested', async () => {
    const prisma = buildPrismaMock();
    const repository = new TagsRepository(prisma);
    await repository.findById('tag-1', true);
    expect(prisma.tag.findFirst).toHaveBeenCalledWith({ where: { id: 'tag-1' } });
  });

  it('findBySlug excludes a given id', async () => {
    const prisma = buildPrismaMock();
    const repository = new TagsRepository(prisma);
    await repository.findBySlug('sports', 'site-1', 'tag-1');
    expect(prisma.tag.findFirst).toHaveBeenCalledWith({
      where: { slug: 'sports', siteId: 'site-1', deletedAt: null, id: { not: 'tag-1' } },
    });
  });

  it('findByName scopes by siteId', async () => {
    const prisma = buildPrismaMock();
    const repository = new TagsRepository(prisma);
    await repository.findByName('Sports', 'site-1');
    expect(prisma.tag.findFirst).toHaveBeenCalledWith({
      where: { name: 'Sports', siteId: 'site-1', deletedAt: null },
    });
  });

  it('findMany applies search filter', async () => {
    const prisma = buildPrismaMock();
    const repository = new TagsRepository(prisma);
    await repository.findMany('site-1', {
      filters: { search: 'spo' },
      sortBy: TagSortField.NAME,
      sortOrder: SortOrder.ASC,
      page: 1,
      limit: 20,
    });
    expect(prisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { name: { contains: 'spo', mode: 'insensitive' } },
            { description: { contains: 'spo', mode: 'insensitive' } },
          ],
        }),
      })
    );
  });

  it('findMany applies pagination', async () => {
    const prisma = buildPrismaMock();
    const repository = new TagsRepository(prisma);
    await repository.findMany('site-1', {
      filters: {},
      sortBy: TagSortField.NAME,
      sortOrder: SortOrder.ASC,
      page: 3,
      limit: 5,
    });
    expect(prisma.tag.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });

  it('countArticlesUsingTag counts ArticleTag rows for non-deleted articles', async () => {
    const prisma = buildPrismaMock();
    const repository = new TagsRepository(prisma);
    await repository.countArticlesUsingTag('tag-1');
    expect(prisma.articleTag.count).toHaveBeenCalledWith({
      where: { tagId: 'tag-1', article: { deletedAt: null } },
    });
  });

  it('softDelete sets deletedAt/deletedBy', async () => {
    const prisma = buildPrismaMock();
    const repository = new TagsRepository(prisma);
    await repository.softDelete('tag-1', 'actor-1');
    expect(prisma.tag.update).toHaveBeenCalledWith({
      where: { id: 'tag-1' },
      data: { deletedAt: expect.any(Date), deletedBy: 'actor-1' },
    });
  });

  it('restore clears deletedAt/deletedBy', async () => {
    const prisma = buildPrismaMock();
    const repository = new TagsRepository(prisma);
    await repository.restore('tag-1', 'actor-1');
    expect(prisma.tag.update).toHaveBeenCalledWith({
      where: { id: 'tag-1' },
      data: { deletedAt: null, deletedBy: null, updatedBy: 'actor-1' },
    });
  });
});
