import { GLOBAL_SCOPE } from '../enums/setting-scope.enum';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { SettingsRepository } from './settings.repository';

function buildPrismaMock() {
  return {
    setting: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('SettingsRepository', () => {
  it('findAll scopes by null siteId/tenantId for GLOBAL scope', async () => {
    const prisma = buildPrismaMock();
    const repository = new SettingsRepository(prisma);

    await repository.findAll(GLOBAL_SCOPE);

    expect(prisma.setting.findMany).toHaveBeenCalledWith({
      where: { siteId: null, tenantId: null, deletedAt: null },
    });
  });

  it('upsert updates the existing row when one is found', async () => {
    const prisma = buildPrismaMock();
    (prisma.setting.findFirst as jest.Mock).mockResolvedValue({ id: 'row-1' });
    const repository = new SettingsRepository(prisma);

    await repository.upsert('general', 'siteName', 'Acme', GLOBAL_SCOPE, 'user-1');

    expect(prisma.setting.update).toHaveBeenCalledWith({
      where: { id: 'row-1' },
      data: { value: 'Acme', updatedBy: 'user-1' },
    });
    expect(prisma.setting.create).not.toHaveBeenCalled();
  });

  it('upsert creates a new row when none is found', async () => {
    const prisma = buildPrismaMock();
    (prisma.setting.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new SettingsRepository(prisma);

    await repository.upsert('general', 'siteName', 'Acme', GLOBAL_SCOPE, 'user-1');

    expect(prisma.setting.create).toHaveBeenCalledWith({
      data: {
        namespace: 'general',
        key: 'siteName',
        value: 'Acme',
        siteId: null,
        tenantId: null,
        createdBy: 'user-1',
        updatedBy: 'user-1',
      },
    });
  });

  it('deleteOverride is a no-op when no row exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.setting.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new SettingsRepository(prisma);

    await repository.deleteOverride('general', 'siteName', GLOBAL_SCOPE, 'user-1');

    expect(prisma.setting.update).not.toHaveBeenCalled();
  });

  it('deleteOverride soft-deletes the existing row', async () => {
    const prisma = buildPrismaMock();
    (prisma.setting.findFirst as jest.Mock).mockResolvedValue({ id: 'row-1' });
    const repository = new SettingsRepository(prisma);

    await repository.deleteOverride('general', 'siteName', GLOBAL_SCOPE, 'user-1');

    expect(prisma.setting.update).toHaveBeenCalledWith({
      where: { id: 'row-1' },
      data: { deletedAt: expect.any(Date), deletedBy: 'user-1' },
    });
  });

  it('deleteCategoryOverrides soft-deletes every row scoped to a category', async () => {
    const prisma = buildPrismaMock();
    const repository = new SettingsRepository(prisma);

    await repository.deleteCategoryOverrides('general', GLOBAL_SCOPE, 'user-1');

    expect(prisma.setting.updateMany).toHaveBeenCalledWith({
      where: { siteId: null, tenantId: null, deletedAt: null, namespace: 'general' },
      data: { deletedAt: expect.any(Date), deletedBy: 'user-1' },
    });
  });
});
