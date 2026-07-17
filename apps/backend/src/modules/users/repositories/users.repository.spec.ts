import { UserStatus } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UserSortField } from '../constants/user.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { UsersRepository } from './users.repository';

function buildPrismaMock() {
  return {
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    mediaAsset: {
      findFirst: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('UsersRepository', () => {
  it('findById excludes soft-deleted users by default', async () => {
    const prisma = buildPrismaMock();
    const repository = new UsersRepository(prisma);
    await repository.findById('user-1');
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: 'user-1', deletedAt: null },
    });
  });

  it('findById includes soft-deleted users when requested', async () => {
    const prisma = buildPrismaMock();
    const repository = new UsersRepository(prisma);
    await repository.findById('user-1', true);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { id: 'user-1' } });
  });

  it('findByEmail excludes a given id (for update-time uniqueness checks)', async () => {
    const prisma = buildPrismaMock();
    const repository = new UsersRepository(prisma);
    await repository.findByEmail('a@b.com', 'user-1');
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'a@b.com', deletedAt: null, id: { not: 'user-1' } },
    });
  });

  it('findMany builds a role filter via the userRoles relation', async () => {
    const prisma = buildPrismaMock();
    const repository = new UsersRepository(prisma);
    await repository.findMany({
      filters: { role: 'Editor' },
      sortBy: UserSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
      page: 1,
      limit: 20,
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userRoles: { some: { role: { name: 'Editor', deletedAt: null } } },
        }),
      })
    );
  });

  it('findMany applies pagination (skip/take) correctly', async () => {
    const prisma = buildPrismaMock();
    const repository = new UsersRepository(prisma);
    await repository.findMany({
      filters: {},
      sortBy: UserSortField.EMAIL,
      sortOrder: SortOrder.ASC,
      page: 3,
      limit: 10,
    });
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10, orderBy: { email: 'asc' } })
    );
  });

  it('create defaults status to PENDING', async () => {
    const prisma = buildPrismaMock();
    const repository = new UsersRepository(prisma);
    await repository.create({ email: 'a@b.com', createdBy: 'actor-1' });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'a@b.com',
        status: UserStatus.PENDING,
        createdBy: 'actor-1',
      }),
    });
  });

  it('softDelete sets deletedAt/deletedBy', async () => {
    const prisma = buildPrismaMock();
    const repository = new UsersRepository(prisma);
    await repository.softDelete('user-1', 'actor-1');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { deletedAt: expect.any(Date), deletedBy: 'actor-1' },
    });
  });

  it('restore clears deletedAt/deletedBy', async () => {
    const prisma = buildPrismaMock();
    const repository = new UsersRepository(prisma);
    await repository.restore('user-1', 'actor-1');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { deletedAt: null, deletedBy: null, updatedBy: 'actor-1' },
    });
  });

  it('findMediaAssetById excludes soft-deleted assets', async () => {
    const prisma = buildPrismaMock();
    const repository = new UsersRepository(prisma);
    await repository.findMediaAssetById('media-1');
    expect(prisma.mediaAsset.findFirst).toHaveBeenCalledWith({
      where: { id: 'media-1', deletedAt: null },
      select: { id: true },
    });
  });
});
