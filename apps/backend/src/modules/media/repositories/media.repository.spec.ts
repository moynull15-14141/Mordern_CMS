import { MediaSortField } from '../constants/media.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MediaRepository } from './media.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
    mediaAsset: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
    author: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
    article: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
    articleMedia: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
  } as unknown as PrismaService;
}

describe('MediaRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new MediaRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  it('findById excludes soft-deleted by default', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.findById('media-1');
    expect(prisma.mediaAsset.findFirst).toHaveBeenCalledWith({
      where: { id: 'media-1', deletedAt: null },
    });
  });

  it('findById includes soft-deleted when requested', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.findById('media-1', true);
    expect(prisma.mediaAsset.findFirst).toHaveBeenCalledWith({ where: { id: 'media-1' } });
  });

  it('findByStorageKey excludes a given id for update-time checks', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.findByStorageKey('key.png', 'site-1', 'media-1');
    expect(prisma.mediaAsset.findFirst).toHaveBeenCalledWith({
      where: { storageKey: 'key.png', siteId: 'site-1', deletedAt: null, id: { not: 'media-1' } },
    });
  });

  it('findMany filters by folderId via the metadata JSON path', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.findMany('site-1', {
      filters: { folderId: 'folder-1' },
      sortBy: MediaSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
      page: 1,
      limit: 20,
    });
    expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ metadata: { path: ['folderId'], equals: 'folder-1' } }),
      })
    );
  });

  it('findMany filters by extension via endsWith', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.findMany('site-1', {
      filters: { extension: '.png' },
      sortBy: MediaSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
      page: 1,
      limit: 20,
    });
    expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ storageKey: { endsWith: '.png', mode: 'insensitive' } }),
      })
    );
  });

  it('findMany applies pagination', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.findMany('site-1', {
      filters: {},
      sortBy: MediaSortField.FILESIZE,
      sortOrder: SortOrder.ASC,
      page: 3,
      limit: 10,
    });
    expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
  });

  it('findPossibleDuplicates matches on mimeType + filesize, excluding self', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.findPossibleDuplicates('image/png', 1024n, 'media-1');
    expect(prisma.mediaAsset.findMany).toHaveBeenCalledWith({
      where: { mimeType: 'image/png', filesize: 1024n, deletedAt: null, id: { not: 'media-1' } },
    });
  });

  it('softDelete sets deletedAt/deletedBy', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.softDelete('media-1', 'actor-1');
    expect(prisma.mediaAsset.update).toHaveBeenCalledWith({
      where: { id: 'media-1' },
      data: { deletedAt: expect.any(Date), deletedBy: 'actor-1' },
    });
  });

  it('restore clears deletedAt/deletedBy', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.restore('media-1', 'actor-1');
    expect(prisma.mediaAsset.update).toHaveBeenCalledWith({
      where: { id: 'media-1' },
      data: { deletedAt: null, deletedBy: null, updatedBy: 'actor-1' },
    });
  });

  it('countUserProfileUsage counts non-deleted users referencing this asset', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.countUserProfileUsage('media-1');
    expect(prisma.user.count).toHaveBeenCalledWith({
      where: { profileImageId: 'media-1', deletedAt: null },
    });
  });

  it('countAuthorProfileUsage counts non-deleted authors referencing this asset', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.countAuthorProfileUsage('media-1');
    expect(prisma.author.count).toHaveBeenCalledWith({
      where: { profileImageId: 'media-1', deletedAt: null },
    });
  });

  it('countArticleFeaturedUsage counts non-deleted articles referencing this asset', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.countArticleFeaturedUsage('media-1');
    expect(prisma.article.count).toHaveBeenCalledWith({
      where: { featuredMediaId: 'media-1', deletedAt: null },
    });
  });

  it('countArticleMediaUsage counts ArticleMedia rows for non-deleted articles', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.countArticleMediaUsage('media-1');
    expect(prisma.articleMedia.count).toHaveBeenCalledWith({
      where: { mediaAssetId: 'media-1', article: { deletedAt: null } },
    });
  });

  it('findUserProfileUsers selects id/displayName/email', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.findUserProfileUsers('media-1');
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { profileImageId: 'media-1', deletedAt: null },
      select: { id: true, displayName: true, email: true },
    });
  });

  it('findFeaturedArticles selects id/title', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaRepository(prisma);
    await repository.findFeaturedArticles('media-1');
    expect(prisma.article.findMany).toHaveBeenCalledWith({
      where: { featuredMediaId: 'media-1', deletedAt: null },
      select: { id: true, title: true },
    });
  });
});
