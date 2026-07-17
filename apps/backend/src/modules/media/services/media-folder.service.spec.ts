import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { SlugShapeValidator } from '../../categories/validators/slug-shape.validator';
import { MediaFolderRepository } from '../repositories/media-folder.repository';
import { MediaFolderMapper } from '../mappers/media-folder.mapper';
import {
  CircularFolderParentException,
  MediaFolderAlreadyDeletedException,
  MediaFolderInUseException,
  MediaFolderNotDeletedException,
  ParentFolderNotFoundException,
  MediaFolderSlugConflictException,
  SelfParentFolderException,
} from '../exceptions/media.exceptions';
import { MediaFolderService } from './media-folder.service';

function buildFolder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'folder-1',
    siteId: 'site-1',
    parentId: null,
    name: 'Photos',
    slug: 'photos',
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findAllForSite: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    findBySlug: jest.fn().mockResolvedValue(null),
    findMany: jest.fn(),
    countActiveChildren: jest.fn().mockResolvedValue(0),
    countActiveAssets: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  } as unknown as MediaFolderRepository;

  const authorizationService = {
    resolveEffectiveRoles: jest.fn().mockResolvedValue([SystemRole.SUPER_ADMIN]),
  } as unknown as AuthorizationService;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new MediaFolderService(
    repository,
    new SlugShapeValidator(),
    new MediaFolderMapper(),
    authorizationService,
    auditLogger
  );

  return { service, repository, authorizationService };
}

const actor = { id: 'user-1' };

describe('MediaFolderService', () => {
  describe('createFolder', () => {
    it('rejects when the given parent does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createFolder({ name: 'Photos', parentId: 'missing' } as never, actor)
      ).rejects.toThrow(ParentFolderNotFoundException);
    });

    it('auto-generates and uniquifies a slug from the name', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock)
        .mockResolvedValueOnce({ id: 'other' })
        .mockResolvedValueOnce(null);
      (repository.create as jest.Mock).mockResolvedValue(buildFolder());
      await service.createFolder({ name: 'Photos' } as never, actor);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'photos-2' }));
    });

    it('rejects an explicit slug that is already taken', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock).mockResolvedValue({ id: 'other' });
      await expect(
        service.createFolder({ name: 'Photos', slug: 'taken' } as never, actor)
      ).rejects.toThrow(MediaFolderSlugConflictException);
    });

    it('denies creation when the actor lacks a taxonomy-managing role', async () => {
      const { service, authorizationService } = buildService();
      (authorizationService.resolveEffectiveRoles as jest.Mock).mockResolvedValue([
        SystemRole.SUBSCRIBER,
      ]);
      await expect(service.createFolder({ name: 'Photos' } as never, actor)).rejects.toThrow();
    });
  });

  describe('deleteFolder', () => {
    it('rejects deleting an already-deleted folder', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildFolder({ deletedAt: new Date() }));
      await expect(service.deleteFolder('folder-1', actor)).rejects.toThrow(
        MediaFolderAlreadyDeletedException
      );
    });

    it('rejects deleting a folder that still contains assets', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildFolder());
      (repository.countActiveAssets as jest.Mock).mockResolvedValue(3);
      await expect(service.deleteFolder('folder-1', actor)).rejects.toThrow(
        MediaFolderInUseException
      );
    });

    it('rejects deleting a folder with active children', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildFolder());
      (repository.countActiveAssets as jest.Mock).mockResolvedValue(0);
      (repository.countActiveChildren as jest.Mock).mockResolvedValue(1);
      await expect(service.deleteFolder('folder-1', actor)).rejects.toThrow(
        MediaFolderInUseException
      );
    });

    it('soft-deletes an empty, childless folder', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildFolder());
      await service.deleteFolder('folder-1', actor);
      expect(repository.softDelete).toHaveBeenCalledWith('folder-1', 'user-1');
    });
  });

  describe('restoreFolder', () => {
    it('rejects restoring a non-deleted folder', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildFolder());
      await expect(service.restoreFolder('folder-1', actor)).rejects.toThrow(
        MediaFolderNotDeletedException
      );
    });

    it('restores a deleted folder', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildFolder({ deletedAt: new Date() }));
      await service.restoreFolder('folder-1', actor);
      expect(repository.restore).toHaveBeenCalledWith('folder-1', 'user-1');
    });
  });

  describe('moveFolder', () => {
    it('rejects a folder becoming its own parent', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildFolder());
      await expect(service.moveFolder('folder-1', { parentId: 'folder-1' }, actor)).rejects.toThrow(
        SelfParentFolderException
      );
    });

    it('rejects a missing new parent', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockImplementation((id: string) =>
        Promise.resolve(id === 'folder-1' ? buildFolder() : null)
      );
      await expect(service.moveFolder('folder-1', { parentId: 'missing' }, actor)).rejects.toThrow(
        ParentFolderNotFoundException
      );
    });

    it('rejects a circular parent', async () => {
      const { service, repository } = buildService();
      const parent = buildFolder({ id: 'parent-1' });
      const child = buildFolder({ id: 'folder-1', parentId: 'parent-1' });
      (repository.findById as jest.Mock).mockImplementation((id: string) =>
        Promise.resolve(id === 'folder-1' ? child : id === 'parent-1' ? parent : null)
      );
      (repository.findAllForSite as jest.Mock).mockResolvedValue([parent, child]);
      await expect(service.moveFolder('parent-1', { parentId: 'folder-1' }, actor)).rejects.toThrow(
        CircularFolderParentException
      );
    });

    it('moves to a valid new parent', async () => {
      const { service, repository } = buildService();
      const newParent = buildFolder({ id: 'new-parent' });
      (repository.findById as jest.Mock).mockImplementation((id: string) =>
        Promise.resolve(id === 'folder-1' ? buildFolder() : id === 'new-parent' ? newParent : null)
      );
      (repository.findAllForSite as jest.Mock).mockResolvedValue([buildFolder(), newParent]);
      (repository.update as jest.Mock).mockResolvedValue(buildFolder({ parentId: 'new-parent' }));
      await service.moveFolder('folder-1', { parentId: 'new-parent' }, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'folder-1',
        expect.objectContaining({ parent: { connect: { id: 'new-parent' } } })
      );
    });
  });

  describe('tree operations', () => {
    it('getTree builds a tree with no sortOrder field present', async () => {
      const { service, repository } = buildService();
      (repository.findAllForSite as jest.Mock).mockResolvedValue([buildFolder()]);
      const tree = await service.getTree();
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('folder-1');
    });

    it('getChildren returns direct children only', async () => {
      const { service, repository } = buildService();
      const parent = buildFolder();
      const child = buildFolder({ id: 'child-1', parentId: 'folder-1' });
      (repository.findById as jest.Mock).mockResolvedValue(parent);
      (repository.findAllForSite as jest.Mock).mockResolvedValue([parent, child]);
      const children = await service.getChildren('folder-1');
      expect(children.map((c) => c.id)).toEqual(['child-1']);
    });

    it('getBreadcrumb returns the root-to-self path', async () => {
      const { service, repository } = buildService();
      const root = buildFolder({ id: 'root-1' });
      const child = buildFolder({ id: 'folder-1', parentId: 'root-1' });
      (repository.findById as jest.Mock).mockResolvedValue(child);
      (repository.findAllForSite as jest.Mock).mockResolvedValue([root, child]);
      const breadcrumb = await service.getBreadcrumb('folder-1');
      expect(breadcrumb.map((b) => b.id)).toEqual(['root-1', 'folder-1']);
    });
  });
});
