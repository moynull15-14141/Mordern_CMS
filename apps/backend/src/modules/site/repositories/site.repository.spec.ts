import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { SiteRepository } from './site.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
  } as unknown as PrismaService;
}

describe('SiteRepository', () => {
  it('getDefaultSite returns the first non-deleted site', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue({ id: 'site-1', name: 'SportingSpy' });

    const repository = new SiteRepository(prisma);
    const result = await repository.getDefaultSite();

    expect(prisma.site.findFirst).toHaveBeenCalledWith({ where: { deletedAt: null } });
    expect(result).toEqual({ id: 'site-1', name: 'SportingSpy' });
  });

  it('throws when no active site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);

    const repository = new SiteRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });
});
