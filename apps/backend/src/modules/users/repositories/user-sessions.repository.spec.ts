import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UserSessionsRepository } from './user-sessions.repository';

function buildPrismaMock() {
  return {
    session: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('UserSessionsRepository', () => {
  it('findAllForUser filters by userId and excludes soft-deleted rows', async () => {
    const prisma = buildPrismaMock();
    const repository = new UserSessionsRepository(prisma);
    await repository.findAllForUser('user-1');
    expect(prisma.session.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', deletedAt: null },
      orderBy: { lastSeenAt: 'desc' },
    });
  });

  it('findById excludes soft-deleted rows', async () => {
    const prisma = buildPrismaMock();
    const repository = new UserSessionsRepository(prisma);
    await repository.findById('session-1');
    expect(prisma.session.findFirst).toHaveBeenCalledWith({
      where: { id: 'session-1', deletedAt: null },
    });
  });
});
