import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { LayoutsRepository } from '../repositories/layouts.repository';
import { LayoutsValidator } from '../validators/layouts.validator';
import { LayoutsMapper } from '../mappers/layouts.mapper';
import {
  LayoutAlreadyDeletedException,
  LayoutNotDeletedException,
  LayoutNotFoundException,
  LayoutSlugConflictException,
} from '../exceptions/layout.exceptions';
import { LayoutsService } from './layouts.service';
import type { Layout } from '@prisma/client';

function buildLayout(overrides: Partial<Layout> = {}): Layout {
  return {
    id: 'layout-1',
    siteId: 'site-1',
    themeId: null,
    name: 'Default',
    slug: 'default',
    status: 'DRAFT',
    layoutPreset: 'default',
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Layout;
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    findBySlug: jest.fn().mockResolvedValue(null),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  } as unknown as LayoutsRepository;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;
  const service = new LayoutsService(
    repository,
    new LayoutsValidator(),
    new LayoutsMapper(),
    auditLogger
  );

  return { service, repository, auditLogger };
}

const actor = { id: 'user-1' };

describe('LayoutsService', () => {
  describe('createLayout', () => {
    it('auto-generates and uniquifies a slug from the name when none is given', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock)
        .mockResolvedValueOnce({ id: 'other' })
        .mockResolvedValueOnce(null);
      (repository.create as jest.Mock).mockResolvedValue(buildLayout({ slug: 'default-2' }));

      await service.createLayout({ name: 'Default', layoutPreset: 'default' } as never, actor);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'default-2' })
      );
    });

    it('rejects a manually-provided slug that is already taken', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock).mockResolvedValue({ id: 'other' });

      await expect(
        service.createLayout(
          { name: 'Default', slug: 'default', layoutPreset: 'default' } as never,
          actor
        )
      ).rejects.toThrow(LayoutSlugConflictException);
    });

    it('creates the layout DRAFT (no status field in CreateLayoutDto)', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildLayout());

      await service.createLayout({ name: 'Default', layoutPreset: 'default' } as never, actor);

      const callArg = (repository.create as jest.Mock).mock.calls[0][0];
      expect(callArg).not.toHaveProperty('status');
    });

    it('connects themeId when given ("theme compatibility")', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildLayout({ themeId: 'theme-1' }));

      await service.createLayout(
        { name: 'Default', layoutPreset: 'default', themeId: 'theme-1' } as never,
        actor
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ theme: { connect: { id: 'theme-1' } } })
      );
    });

    it('omits the theme relation entirely when no themeId is given ("compatible with any theme")', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildLayout());

      await service.createLayout({ name: 'Default', layoutPreset: 'default' } as never, actor);

      const callArg = (repository.create as jest.Mock).mock.calls[0][0];
      expect(callArg).not.toHaveProperty('theme');
    });

    it('records a layout.create audit log entry', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildLayout());

      await service.createLayout({ name: 'Default', layoutPreset: 'default' } as never, actor);

      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: actor.id,
          action: 'layout.create',
          resourceId: 'layout-1',
        })
      );
    });
  });

  describe('getLayout', () => {
    it('throws LayoutNotFoundException when the layout does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getLayout('missing')).rejects.toThrow(LayoutNotFoundException);
    });

    it('returns the mapped layout when found', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildLayout());
      const result = await service.getLayout('layout-1');
      expect(result.id).toBe('layout-1');
    });
  });

  describe('listLayouts', () => {
    it('returns a paginated result built from the repository response', async () => {
      const { service, repository } = buildService();
      (repository.findMany as jest.Mock).mockResolvedValue({ items: [buildLayout()], total: 1 });

      const result = await service.listLayouts({
        filters: {},
        sortBy: 'createdAt' as never,
        sortOrder: 'desc' as never,
        page: 1,
        limit: 20,
      });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('updateLayout', () => {
    it('throws LayoutNotFoundException when the layout does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.updateLayout('missing', {} as never, actor)).rejects.toThrow(
        LayoutNotFoundException
      );
    });

    it('leaves the slug untouched when the update does not change it', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildLayout());
      (repository.update as jest.Mock).mockResolvedValue(buildLayout());

      await service.updateLayout('layout-1', { name: 'New Name' } as never, actor);

      expect(repository.findBySlug).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(
        'layout-1',
        expect.objectContaining({ slug: undefined })
      );
    });

    it('re-validates and re-uniquifies the slug when it changes', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildLayout());
      (repository.findBySlug as jest.Mock).mockResolvedValue(null);
      (repository.update as jest.Mock).mockResolvedValue(buildLayout({ slug: 'new-slug' }));

      await service.updateLayout('layout-1', { slug: 'new-slug' } as never, actor);

      expect(repository.findBySlug).toHaveBeenCalledWith('new-slug', 'site-1', 'layout-1');
    });

    it('allows updating status directly', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildLayout());
      (repository.update as jest.Mock).mockResolvedValue(buildLayout({ status: 'PUBLISHED' }));

      await service.updateLayout('layout-1', { status: 'PUBLISHED' } as never, actor);

      expect(repository.update).toHaveBeenCalledWith(
        'layout-1',
        expect.objectContaining({ status: 'PUBLISHED' })
      );
    });

    it('connects a new themeId when given', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildLayout());
      (repository.update as jest.Mock).mockResolvedValue(buildLayout({ themeId: 'theme-2' }));

      await service.updateLayout('layout-1', { themeId: 'theme-2' } as never, actor);

      expect(repository.update).toHaveBeenCalledWith(
        'layout-1',
        expect.objectContaining({ theme: { connect: { id: 'theme-2' } } })
      );
    });

    it('disconnects the theme when themeId is explicitly set to null', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildLayout({ themeId: 'theme-1' }));
      (repository.update as jest.Mock).mockResolvedValue(buildLayout());

      await service.updateLayout('layout-1', { themeId: null } as never, actor);

      expect(repository.update).toHaveBeenCalledWith(
        'layout-1',
        expect.objectContaining({ theme: { disconnect: true } })
      );
    });

    it('does not touch the theme relation when themeId is omitted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildLayout());
      (repository.update as jest.Mock).mockResolvedValue(buildLayout());

      await service.updateLayout('layout-1', { name: 'New Name' } as never, actor);

      const callArg = (repository.update as jest.Mock).mock.calls[0][1];
      expect(callArg).not.toHaveProperty('theme');
    });
  });

  describe('deleteLayout / restoreLayout', () => {
    it('rejects deleting an already-deleted layout', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildLayout({ deletedAt: new Date() }));
      await expect(service.deleteLayout('layout-1', actor)).rejects.toThrow(
        LayoutAlreadyDeletedException
      );
    });

    it('soft-deletes an active (non-deleted) layout', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildLayout())
        .mockResolvedValueOnce(buildLayout({ deletedAt: new Date() }));

      await service.deleteLayout('layout-1', actor);

      expect(repository.softDelete).toHaveBeenCalledWith('layout-1', actor.id);
    });

    it('rejects restoring a layout that is not deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildLayout({ deletedAt: null }));
      await expect(service.restoreLayout('layout-1', actor)).rejects.toThrow(
        LayoutNotDeletedException
      );
    });

    it('restores a deleted layout', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildLayout({ deletedAt: new Date() }))
        .mockResolvedValueOnce(buildLayout({ deletedAt: null }));

      await service.restoreLayout('layout-1', actor);

      expect(repository.restore).toHaveBeenCalledWith('layout-1', actor.id);
    });
  });
});
