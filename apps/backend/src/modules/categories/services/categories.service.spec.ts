import { CategoryStatus } from '@prisma/client';
import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { CategoriesRepository } from '../repositories/categories.repository';
import { SlugShapeValidator } from '../validators/slug-shape.validator';
import { CategoriesMapper } from '../mappers/categories.mapper';
import {
  CategoryAlreadyDeletedException,
  CategoryInUseException,
  CategoryNameConflictException,
  CategoryNotDeletedException,
  CategoryNotFoundException,
  CategorySlugConflictException,
  CircularParentException,
  ParentCategoryNotFoundException,
  SelfParentException,
} from '../exceptions/category.exceptions';
import { CategoriesService } from './categories.service';

function buildCategory(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cat-1',
    siteId: 'site-1',
    parentId: null,
    name: 'News',
    slug: 'news',
    description: null,
    status: CategoryStatus.ACTIVE,
    seoMetaId: null,
    sortOrder: 1,
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
    findByName: jest.fn().mockResolvedValue(null),
    findMany: jest.fn(),
    countArticlesUsingCategory: jest.fn().mockResolvedValue(0),
    countActiveChildren: jest.fn().mockResolvedValue(0),
    findSeoMetaById: jest.fn().mockResolvedValue(null),
    countArticlesUsingCategories: jest.fn().mockResolvedValue(new Map()),
    countActiveChildrenForCategories: jest.fn().mockResolvedValue(new Map()),
    findSeoMetaByIds: jest.fn().mockResolvedValue(new Map()),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    upsertSeoMeta: jest.fn().mockResolvedValue('seo-1'),
  } as unknown as CategoriesRepository;

  const authorizationService = {
    resolveEffectiveRoles: jest.fn().mockResolvedValue([SystemRole.SUPER_ADMIN]),
  } as unknown as AuthorizationService;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new CategoriesService(
    repository,
    new SlugShapeValidator(),
    new CategoriesMapper(),
    authorizationService,
    auditLogger
  );

  return { service, repository, authorizationService };
}

const actor = { id: 'user-1' };

describe('CategoriesService', () => {
  describe('createCategory', () => {
    it('rejects when the given parent does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createCategory({ name: 'News', parentId: 'missing' } as never, actor)
      ).rejects.toThrow(ParentCategoryNotFoundException);
    });

    it('rejects a duplicate name', async () => {
      const { service, repository } = buildService();
      (repository.findByName as jest.Mock).mockResolvedValue(buildCategory());
      await expect(service.createCategory({ name: 'News' } as never, actor)).rejects.toThrow(
        CategoryNameConflictException
      );
    });

    it('auto-generates and uniquifies a slug from the name', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock)
        .mockResolvedValueOnce({ id: 'other' })
        .mockResolvedValueOnce(null);
      (repository.create as jest.Mock).mockResolvedValue(buildCategory());
      await service.createCategory({ name: 'News' } as never, actor);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'news-2' }));
    });

    it('rejects an explicit slug that is already taken', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock).mockResolvedValue({ id: 'other' });
      await expect(
        service.createCategory({ name: 'News', slug: 'taken' } as never, actor)
      ).rejects.toThrow(CategorySlugConflictException);
    });

    it('creates the category and audits the action', async () => {
      const { service, repository } = buildService();
      const created = buildCategory();
      (repository.create as jest.Mock).mockResolvedValue(created);
      const result = await service.createCategory({ name: 'News' } as never, actor);
      expect(result.id).toBe('cat-1');
      expect(repository.create).toHaveBeenCalled();
    });
  });

  describe('getCategory', () => {
    it('throws CategoryNotFoundException when missing', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getCategory('missing')).rejects.toThrow(CategoryNotFoundException);
    });

    it('maps a found category with computed counts', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildCategory());
      (repository.countArticlesUsingCategory as jest.Mock).mockResolvedValue(4);
      (repository.countActiveChildren as jest.Mock).mockResolvedValue(2);
      const result = await service.getCategory('cat-1');
      expect(result.articleCount).toBe(4);
      expect(result.childrenCount).toBe(2);
    });
  });

  describe('updateCategory', () => {
    it('denies update when the actor lacks a taxonomy-managing role', async () => {
      const { service, repository, authorizationService } = buildService();
      (authorizationService.resolveEffectiveRoles as jest.Mock).mockResolvedValue([
        SystemRole.SUBSCRIBER,
      ]);
      (repository.findById as jest.Mock).mockResolvedValue(buildCategory());
      await expect(
        service.updateCategory('cat-1', { name: 'Updated' } as never, actor)
      ).rejects.toThrow();
    });

    it('rejects a duplicate name on rename', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildCategory());
      (repository.findByName as jest.Mock).mockResolvedValue(buildCategory({ id: 'other' }));
      await expect(
        service.updateCategory('cat-1', { name: 'Other Name' } as never, actor)
      ).rejects.toThrow(CategoryNameConflictException);
    });

    it('updates when allowed', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildCategory());
      (repository.update as jest.Mock).mockResolvedValue(buildCategory({ description: 'Updated' }));
      await service.updateCategory('cat-1', { description: 'Updated' } as never, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'cat-1',
        expect.objectContaining({ description: 'Updated' })
      );
    });
  });

  describe('deleteCategory', () => {
    it('rejects deleting an already-deleted category', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(
        buildCategory({ deletedAt: new Date() })
      );
      await expect(service.deleteCategory('cat-1', actor)).rejects.toThrow(
        CategoryAlreadyDeletedException
      );
    });

    it('rejects deleting a category still used by articles', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildCategory());
      (repository.countArticlesUsingCategory as jest.Mock).mockResolvedValue(1);
      await expect(service.deleteCategory('cat-1', actor)).rejects.toThrow(CategoryInUseException);
    });

    it('rejects deleting a category with active children', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildCategory());
      (repository.countArticlesUsingCategory as jest.Mock).mockResolvedValue(0);
      (repository.countActiveChildren as jest.Mock).mockResolvedValue(1);
      await expect(service.deleteCategory('cat-1', actor)).rejects.toThrow(CategoryInUseException);
    });

    it('soft-deletes when unused', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildCategory());
      await service.deleteCategory('cat-1', actor);
      expect(repository.softDelete).toHaveBeenCalledWith('cat-1', 'user-1');
    });
  });

  describe('restoreCategory', () => {
    it('rejects restoring a non-deleted category', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildCategory());
      await expect(service.restoreCategory('cat-1', actor)).rejects.toThrow(
        CategoryNotDeletedException
      );
    });

    it('restores a deleted category', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(
        buildCategory({ deletedAt: new Date() })
      );
      await service.restoreCategory('cat-1', actor);
      expect(repository.restore).toHaveBeenCalledWith('cat-1', 'user-1');
    });
  });

  describe('moveCategory', () => {
    it('rejects a category becoming its own parent', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildCategory());
      await expect(service.moveCategory('cat-1', { parentId: 'cat-1' }, actor)).rejects.toThrow(
        SelfParentException
      );
    });

    it('rejects a missing new parent', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockImplementation((id: string) =>
        id === 'cat-1' ? Promise.resolve(buildCategory()) : Promise.resolve(null)
      );
      await expect(service.moveCategory('cat-1', { parentId: 'missing' }, actor)).rejects.toThrow(
        ParentCategoryNotFoundException
      );
    });

    it('rejects a circular parent', async () => {
      const { service, repository } = buildService();
      const parent = buildCategory({ id: 'parent-1' });
      const child = buildCategory({ id: 'cat-1', parentId: 'parent-1' });
      (repository.findById as jest.Mock).mockImplementation((id: string) =>
        Promise.resolve(id === 'cat-1' ? child : id === 'parent-1' ? parent : null)
      );
      (repository.findAllForSite as jest.Mock).mockResolvedValue([parent, child]);
      await expect(service.moveCategory('parent-1', { parentId: 'cat-1' }, actor)).rejects.toThrow(
        CircularParentException
      );
    });

    it('moves to a valid new parent', async () => {
      const { service, repository } = buildService();
      const newParent = buildCategory({ id: 'new-parent' });
      (repository.findById as jest.Mock).mockImplementation((id: string) =>
        Promise.resolve(id === 'cat-1' ? buildCategory() : id === 'new-parent' ? newParent : null)
      );
      (repository.findAllForSite as jest.Mock).mockResolvedValue([buildCategory(), newParent]);
      (repository.update as jest.Mock).mockResolvedValue(buildCategory({ parentId: 'new-parent' }));
      await service.moveCategory('cat-1', { parentId: 'new-parent' }, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'cat-1',
        expect.objectContaining({ parent: { connect: { id: 'new-parent' } } })
      );
    });

    it('moves to root when parentId is null', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(
        buildCategory({ parentId: 'old-parent' })
      );
      (repository.update as jest.Mock).mockResolvedValue(buildCategory({ parentId: null }));
      await service.moveCategory('cat-1', { parentId: null }, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'cat-1',
        expect.objectContaining({ parent: { disconnect: true } })
      );
    });
  });

  describe('tree operations', () => {
    it('getTree builds a tree from the site categories', async () => {
      const { service, repository } = buildService();
      (repository.findAllForSite as jest.Mock).mockResolvedValue([buildCategory()]);
      const tree = await service.getTree();
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('cat-1');
    });

    it('getFlat returns every category mapped', async () => {
      const { service, repository } = buildService();
      (repository.findAllForSite as jest.Mock).mockResolvedValue([buildCategory()]);
      const flat = await service.getFlat();
      expect(flat).toHaveLength(1);
    });

    it('getFlat issues exactly one batched call per count/lookup type, not one per category (N+1 fix)', async () => {
      const { service, repository } = buildService();
      const categories = [
        buildCategory({ id: 'cat-1' }),
        buildCategory({ id: 'cat-2' }),
        buildCategory({ id: 'cat-3' }),
      ];
      (repository.findAllForSite as jest.Mock).mockResolvedValue(categories);
      const flat = await service.getFlat();
      expect(flat).toHaveLength(3);
      expect(repository.countArticlesUsingCategories).toHaveBeenCalledTimes(1);
      expect(repository.countArticlesUsingCategories).toHaveBeenCalledWith([
        'cat-1',
        'cat-2',
        'cat-3',
      ]);
      expect(repository.countActiveChildrenForCategories).toHaveBeenCalledTimes(1);
      expect(repository.countArticlesUsingCategory).not.toHaveBeenCalled();
      expect(repository.countActiveChildren).not.toHaveBeenCalled();
    });

    it('getChildren returns direct children only', async () => {
      const { service, repository } = buildService();
      const parent = buildCategory();
      const child = buildCategory({ id: 'child-1', parentId: 'cat-1' });
      (repository.findById as jest.Mock).mockResolvedValue(parent);
      (repository.findAllForSite as jest.Mock).mockResolvedValue([parent, child]);
      const children = await service.getChildren('cat-1');
      expect(children.map((c) => c.id)).toEqual(['child-1']);
    });

    it('getBreadcrumb returns the root-to-self path', async () => {
      const { service, repository } = buildService();
      const root = buildCategory({ id: 'root-1' });
      const child = buildCategory({ id: 'cat-1', parentId: 'root-1' });
      (repository.findById as jest.Mock).mockResolvedValue(child);
      (repository.findAllForSite as jest.Mock).mockResolvedValue([root, child]);
      const breadcrumb = await service.getBreadcrumb('cat-1');
      expect(breadcrumb.map((b) => b.id)).toEqual(['root-1', 'cat-1']);
    });
  });
});
