import { MediaFolderSortField } from '../constants/media.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MediaFolderRepository } from './media-folder.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
    mediaFolder: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    mediaAsset: { count: jest.fn().mockResolvedValue(0) },
  } as unknown as PrismaService;
}

describe('MediaFolderRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new MediaFolderRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  it('findAllForSite scopes by siteId and excludes soft-deleted rows', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaFolderRepository(prisma);
    await repository.findAllForSite('site-1');
    expect(prisma.mediaFolder.findMany).toHaveBeenCalledWith({
      where: { siteId: 'site-1', deletedAt: null },
    });
  });

  it('findById excludes soft-deleted by default', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaFolderRepository(prisma);
    await repository.findById('folder-1');
    expect(prisma.mediaFolder.findFirst).toHaveBeenCalledWith({
      where: { id: 'folder-1', deletedAt: null },
    });
  });

  it('findBySlug excludes a given id', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaFolderRepository(prisma);
    await repository.findBySlug('photos', 'site-1', 'folder-1');
    expect(prisma.mediaFolder.findFirst).toHaveBeenCalledWith({
      where: { slug: 'photos', siteId: 'site-1', deletedAt: null, id: { not: 'folder-1' } },
    });
  });

  it('findMany filters by parentId', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaFolderRepository(prisma);
    await repository.findMany('site-1', {
      filters: { parentId: 'root-1' },
      sortBy: MediaFolderSortField.NAME,
      sortOrder: SortOrder.ASC,
      page: 1,
      limit: 20,
    });
    expect(prisma.mediaFolder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ parentId: 'root-1' }) })
    );
  });

  it('findMany applies pagination', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaFolderRepository(prisma);
    await repository.findMany('site-1', {
      filters: {},
      sortBy: MediaFolderSortField.NAME,
      sortOrder: SortOrder.ASC,
      page: 2,
      limit: 5,
    });
    expect(prisma.mediaFolder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('countActiveChildren counts non-deleted folders by parentId', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaFolderRepository(prisma);
    await repository.countActiveChildren('folder-1');
    expect(prisma.mediaFolder.count).toHaveBeenCalledWith({
      where: { parentId: 'folder-1', deletedAt: null },
    });
  });

  it('countActiveAssets counts assets whose metadata.folderId matches', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaFolderRepository(prisma);
    await repository.countActiveAssets('folder-1');
    expect(prisma.mediaAsset.count).toHaveBeenCalledWith({
      where: { deletedAt: null, metadata: { path: ['folderId'], equals: 'folder-1' } },
    });
  });

  it('softDelete sets deletedAt/deletedBy', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaFolderRepository(prisma);
    await repository.softDelete('folder-1', 'actor-1');
    expect(prisma.mediaFolder.update).toHaveBeenCalledWith({
      where: { id: 'folder-1' },
      data: { deletedAt: expect.any(Date), deletedBy: 'actor-1' },
    });
  });

  it('restore clears deletedAt/deletedBy', async () => {
    const prisma = buildPrismaMock();
    const repository = new MediaFolderRepository(prisma);
    await repository.restore('folder-1', 'actor-1');
    expect(prisma.mediaFolder.update).toHaveBeenCalledWith({
      where: { id: 'folder-1' },
      data: { deletedAt: null, deletedBy: null, updatedBy: 'actor-1' },
    });
  });
});
