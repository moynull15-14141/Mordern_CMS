import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { LayoutAssignmentsRepository } from '../repositories/layout-assignments.repository';
import { LayoutAssignmentsValidator } from '../validators/layout-assignments.validator';
import { LayoutAssignmentsMapper } from '../mappers/layout-assignments.mapper';
import {
  InvalidLayoutAssignmentTargetException,
  LayoutAssignmentNotFoundException,
  LayoutAssignmentTargetNotFoundException,
} from '../exceptions/layout.exceptions';
import { LayoutAssignmentsService } from './layout-assignments.service';
import type { LayoutAssignment } from '@prisma/client';

function buildAssignment(overrides: Partial<LayoutAssignment> = {}): LayoutAssignment {
  return {
    id: 'assignment-1',
    siteId: 'site-1',
    layoutId: 'layout-1',
    contentType: 'PAGE',
    pageId: 'page-1',
    articleId: null,
    categoryId: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as LayoutAssignment;
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    findByTarget: jest.fn().mockResolvedValue(null),
    findMany: jest.fn(),
    findLayoutById: jest.fn().mockResolvedValue({ id: 'layout-1' }),
    findPageById: jest.fn().mockResolvedValue({ id: 'page-1' }),
    findArticleById: jest.fn().mockResolvedValue({ id: 'article-1' }),
    findCategoryById: jest.fn().mockResolvedValue({ id: 'cat-1' }),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  } as unknown as LayoutAssignmentsRepository;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;
  const service = new LayoutAssignmentsService(
    repository,
    new LayoutAssignmentsValidator(),
    new LayoutAssignmentsMapper(),
    auditLogger
  );

  return { service, repository, auditLogger };
}

const actor = { id: 'user-1' };

describe('LayoutAssignmentsService', () => {
  describe('assignLayout', () => {
    it('rejects an invalid target shape before touching the repository', async () => {
      const { service, repository } = buildService();
      await expect(
        service.assignLayout(
          { layoutId: 'layout-1', contentType: 'HOMEPAGE', pageId: 'page-1' } as never,
          actor
        )
      ).rejects.toThrow(InvalidLayoutAssignmentTargetException);
      expect(repository.findLayoutById).not.toHaveBeenCalled();
    });

    it('throws LayoutAssignmentTargetNotFoundException for an unknown layoutId', async () => {
      const { service, repository } = buildService();
      (repository.findLayoutById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.assignLayout({ layoutId: 'missing', contentType: 'HOMEPAGE' } as never, actor)
      ).rejects.toThrow(LayoutAssignmentTargetNotFoundException);
    });

    it('throws LayoutAssignmentTargetNotFoundException for an unknown pageId', async () => {
      const { service, repository } = buildService();
      (repository.findPageById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.assignLayout(
          { layoutId: 'layout-1', contentType: 'PAGE', pageId: 'missing' } as never,
          actor
        )
      ).rejects.toThrow(LayoutAssignmentTargetNotFoundException);
    });

    it('creates a new assignment when none exists for the target', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildAssignment());

      await service.assignLayout(
        { layoutId: 'layout-1', contentType: 'PAGE', pageId: 'page-1' } as never,
        actor
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          layout: { connect: { id: 'layout-1' } },
          contentType: 'PAGE',
          page: { connect: { id: 'page-1' } },
          article: undefined,
          category: undefined,
        })
      );
    });

    it('upserts (updates layoutId in place) when an assignment already exists for the target', async () => {
      const { service, repository } = buildService();
      (repository.findByTarget as jest.Mock).mockResolvedValue(
        buildAssignment({ id: 'existing-1' })
      );
      (repository.update as jest.Mock).mockResolvedValue(buildAssignment({ layoutId: 'layout-2' }));

      await service.assignLayout(
        { layoutId: 'layout-2', contentType: 'PAGE', pageId: 'page-1' } as never,
        actor
      );

      expect(repository.update).toHaveBeenCalledWith('existing-1', {
        layout: { connect: { id: 'layout-2' } },
        updatedBy: actor.id,
      });
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('creates a content-default assignment when no entity FK is given', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildAssignment({ pageId: null }));

      await service.assignLayout({ layoutId: 'layout-1', contentType: 'PAGE' } as never, actor);

      expect(repository.findByTarget).toHaveBeenCalledWith('site-1', {
        contentType: 'PAGE',
        pageId: null,
        articleId: null,
        categoryId: null,
      });
    });

    it('records a layout-assignment.create audit log entry on create', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildAssignment());

      await service.assignLayout(
        { layoutId: 'layout-1', contentType: 'PAGE', pageId: 'page-1' } as never,
        actor
      );

      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'layout-assignment.create', resourceId: 'assignment-1' })
      );
    });
  });

  describe('getAssignment', () => {
    it('throws LayoutAssignmentNotFoundException when missing', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getAssignment('missing')).rejects.toThrow(
        LayoutAssignmentNotFoundException
      );
    });
  });

  describe('listAssignments', () => {
    it('passes an optional contentType filter through to the repository', async () => {
      const { service, repository } = buildService();
      (repository.findMany as jest.Mock).mockResolvedValue([buildAssignment()]);

      const result = await service.listAssignments('PAGE' as never);

      expect(repository.findMany).toHaveBeenCalledWith('site-1', 'PAGE');
      expect(result).toHaveLength(1);
    });
  });

  describe('unassign / restoreAssignment', () => {
    it('soft-deletes and returns the post-delete state', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildAssignment())
        .mockResolvedValueOnce(buildAssignment({ deletedAt: new Date() }));

      const result = await service.unassign('assignment-1', actor);

      expect(repository.softDelete).toHaveBeenCalledWith('assignment-1', actor.id);
      expect(result.deletedAt).not.toBeNull();
    });

    it('restores a soft-deleted assignment', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildAssignment({ deletedAt: new Date() }))
        .mockResolvedValueOnce(buildAssignment({ deletedAt: null }));

      await service.restoreAssignment('assignment-1', actor);

      expect(repository.restore).toHaveBeenCalledWith('assignment-1', actor.id);
    });
  });
});
