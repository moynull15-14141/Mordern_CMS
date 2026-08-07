import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PatternFavoriteRepository } from './pattern-favorite.repository';

function buildPrismaMock() {
  return {
    patternFavorite: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
  } as unknown as PrismaService;
}

describe('PatternFavoriteRepository', () => {
  it('isFavorite returns true when a row exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.patternFavorite.findUnique as jest.Mock).mockResolvedValue({
      userId: 'u1',
      patternId: 'p1',
    });
    const repository = new PatternFavoriteRepository(prisma);
    await expect(repository.isFavorite('u1', 'p1')).resolves.toBe(true);
  });

  it('isFavorite returns false when no row exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.patternFavorite.findUnique as jest.Mock).mockResolvedValue(null);
    const repository = new PatternFavoriteRepository(prisma);
    await expect(repository.isFavorite('u1', 'p1')).resolves.toBe(false);
  });

  it('addFavorite upserts on the composite key', async () => {
    const prisma = buildPrismaMock();
    const repository = new PatternFavoriteRepository(prisma);
    await repository.addFavorite('u1', 'p1');
    expect(prisma.patternFavorite.upsert).toHaveBeenCalledWith({
      where: { userId_patternId: { userId: 'u1', patternId: 'p1' } },
      create: { userId: 'u1', patternId: 'p1' },
      update: {},
    });
  });

  it('removeFavorite deletes by userId/patternId', async () => {
    const prisma = buildPrismaMock();
    const repository = new PatternFavoriteRepository(prisma);
    await repository.removeFavorite('u1', 'p1');
    expect(prisma.patternFavorite.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1', patternId: 'p1' },
    });
  });

  it('findFavoritePatterns scopes by userId and active patterns in the given site, newest first', async () => {
    const prisma = buildPrismaMock();
    (prisma.patternFavorite.findMany as jest.Mock).mockResolvedValue([{ pattern: { id: 'p1' } }]);
    const repository = new PatternFavoriteRepository(prisma);
    const result = await repository.findFavoritePatterns('u1', 'site-1');
    expect(prisma.patternFavorite.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1', pattern: { siteId: 'site-1', deletedAt: null } },
      include: { pattern: true },
      orderBy: { createdAt: 'desc' },
    });
    expect(result).toEqual([{ id: 'p1' }]);
  });
});
