import { MenuItemTargetType, MenuStatus } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { MenusRepository, MenuWithItems } from '../repositories/menus.repository';
import { MenusValidator } from '../validators/menus.validator';
import { MenusMapper } from '../mappers/menus.mapper';
import {
  CircularMenuItemParentException,
  InvalidMenuItemTargetException,
  MenuAlreadyDeletedException,
  MenuItemInUseException,
  MenuItemNotFoundException,
  MenuItemTargetNotFoundException,
  MenuLocationConflictException,
  MenuNotDeletedException,
  MenuNotFoundException,
  MenuSlugConflictException,
  ParentMenuItemNotFoundException,
  SelfParentMenuItemException,
} from '../exceptions/menu.exceptions';
import { MenusService } from './menus.service';

function buildMenu(overrides: Partial<MenuWithItems> = {}): MenuWithItems {
  return {
    id: 'menu-1',
    siteId: 'site-1',
    name: 'Header',
    slug: 'header',
    location: 'header',
    status: MenuStatus.DRAFT,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    items: [],
    ...overrides,
  } as MenuWithItems;
}

function buildItem(overrides: Record<string, unknown> = {}) {
  return {
    id: 'item-1',
    menuId: 'menu-1',
    parentId: null,
    label: 'Home',
    targetType: MenuItemTargetType.PAGE,
    pageId: 'page-1',
    articleId: null,
    categoryId: null,
    url: null,
    openMode: 'SELF',
    icon: null,
    cssClass: null,
    sortOrder: 0,
    layoutMeta: null,
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
    findById: jest.fn(),
    findBySlug: jest.fn().mockResolvedValue(null),
    findByLocation: jest.fn().mockResolvedValue(null),
    findBySlugWithItems: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    findItemById: jest.fn(),
    findItemsByMenuId: jest.fn().mockResolvedValue([]),
    countActiveChildren: jest.fn().mockResolvedValue(0),
    createItem: jest.fn(),
    updateItem: jest.fn(),
    softDeleteItem: jest.fn(),
    reorderItems: jest.fn(),
    findPageById: jest.fn().mockResolvedValue({ id: 'page-1', siteId: 'site-1' }),
    findArticleById: jest.fn().mockResolvedValue({ id: 'article-1', siteId: 'site-1' }),
    findCategoryById: jest.fn().mockResolvedValue({ id: 'cat-1', siteId: 'site-1' }),
  } as unknown as MenusRepository;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;
  const service = new MenusService(
    repository,
    new MenusValidator(),
    new MenusMapper(),
    auditLogger
  );

  return { service, repository };
}

const actor = { id: 'user-1' };

describe('MenusService', () => {
  describe('createMenu', () => {
    it('auto-generates and uniquifies a slug from the name when none is given', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock)
        .mockResolvedValueOnce({ id: 'other' })
        .mockResolvedValueOnce(null);
      (repository.create as jest.Mock).mockResolvedValue(buildMenu({ slug: 'header-2' }));

      await service.createMenu({ name: 'Header' } as never, actor);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'header-2' }));
    });

    it('rejects a manually-provided slug that is already taken', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock).mockResolvedValue({ id: 'other' });

      await expect(
        service.createMenu({ name: 'Header', slug: 'header' } as never, actor)
      ).rejects.toThrow(MenuSlugConflictException);
    });

    it('does not check location uniqueness when no location is given', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildMenu());

      await service.createMenu({ name: 'Header' } as never, actor);

      expect(repository.findByLocation).not.toHaveBeenCalled();
    });

    it('rejects a location already used by another menu on the same site', async () => {
      const { service, repository } = buildService();
      (repository.findByLocation as jest.Mock).mockResolvedValue({ id: 'other-menu' });

      await expect(
        service.createMenu({ name: 'Header', location: 'header' } as never, actor)
      ).rejects.toThrow(MenuLocationConflictException);
    });

    it('creates a menu with a unique location', async () => {
      const { service, repository } = buildService();
      (repository.findByLocation as jest.Mock).mockResolvedValue(null);
      (repository.create as jest.Mock).mockResolvedValue(buildMenu({ location: 'footer' }));

      await service.createMenu({ name: 'Footer', location: 'footer' } as never, actor);

      expect(repository.findByLocation).toHaveBeenCalledWith('footer', 'site-1', undefined);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ location: 'footer' })
      );
    });
  });

  describe('updateMenu', () => {
    it('throws MenuNotFoundException when the menu does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.updateMenu('missing', {} as never, actor)).rejects.toThrow(
        MenuNotFoundException
      );
    });

    it('re-validates the slug when it changes', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findBySlug as jest.Mock).mockResolvedValue(null);
      (repository.update as jest.Mock).mockResolvedValue(buildMenu({ slug: 'new-slug' }));

      await service.updateMenu('menu-1', { slug: 'new-slug' } as never, actor);

      expect(repository.findBySlug).toHaveBeenCalledWith('new-slug', 'site-1', 'menu-1');
    });

    it('does not re-check location uniqueness when location is unchanged', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu({ location: 'header' }));
      (repository.update as jest.Mock).mockResolvedValue(buildMenu());

      await service.updateMenu('menu-1', { location: 'header' } as never, actor);

      expect(repository.findByLocation).not.toHaveBeenCalled();
    });

    it('rejects changing location to one already used by another menu', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu({ location: 'header' }));
      (repository.findByLocation as jest.Mock).mockResolvedValue({ id: 'other-menu' });

      await expect(
        service.updateMenu('menu-1', { location: 'footer' } as never, actor)
      ).rejects.toThrow(MenuLocationConflictException);
    });

    it('excludes itself when re-checking location uniqueness', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu({ location: 'header' }));
      (repository.findByLocation as jest.Mock).mockResolvedValue(null);
      (repository.update as jest.Mock).mockResolvedValue(buildMenu({ location: 'footer' }));

      await service.updateMenu('menu-1', { location: 'footer' } as never, actor);

      expect(repository.findByLocation).toHaveBeenCalledWith('footer', 'site-1', 'menu-1');
    });
  });

  describe('deleteMenu / restoreMenu', () => {
    it('rejects deleting an already-deleted menu', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu({ deletedAt: new Date() }));
      await expect(service.deleteMenu('menu-1', actor)).rejects.toThrow(
        MenuAlreadyDeletedException
      );
    });

    it('rejects restoring a menu that is not deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu({ deletedAt: null }));
      await expect(service.restoreMenu('menu-1', actor)).rejects.toThrow(MenuNotDeletedException);
    });
  });

  describe('createMenuItem', () => {
    it('creates an item with a valid PAGE target', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.createItem as jest.Mock).mockResolvedValue(buildItem());

      await service.createMenuItem(
        'menu-1',
        { label: 'Home', targetType: 'PAGE', pageId: 'page-1' } as never,
        actor
      );

      expect(repository.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Home', targetType: 'PAGE' })
      );
    });

    it('rejects a target with more than one of pageId/articleId/categoryId/url set', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());

      await expect(
        service.createMenuItem(
          'menu-1',
          { label: 'Home', targetType: 'PAGE', pageId: 'page-1', url: 'https://x.com' } as never,
          actor
        )
      ).rejects.toThrow(InvalidMenuItemTargetException);
    });

    it('rejects a PAGE target that does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findPageById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createMenuItem(
          'menu-1',
          { label: 'Home', targetType: 'PAGE', pageId: 'missing' } as never,
          actor
        )
      ).rejects.toThrow(MenuItemTargetNotFoundException);
    });

    it('rejects a target belonging to a different site', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findPageById as jest.Mock).mockResolvedValue({
        id: 'page-1',
        siteId: 'other-site',
      });

      await expect(
        service.createMenuItem(
          'menu-1',
          { label: 'Home', targetType: 'PAGE', pageId: 'page-1' } as never,
          actor
        )
      ).rejects.toThrow(MenuItemTargetNotFoundException);
    });

    it('rejects a parentId that does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findItemById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createMenuItem(
          'menu-1',
          { label: 'Home', targetType: 'PAGE', pageId: 'page-1', parentId: 'missing' } as never,
          actor
        )
      ).rejects.toThrow(ParentMenuItemNotFoundException);
    });

    it('accepts a valid EXTERNAL_URL target', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.createItem as jest.Mock).mockResolvedValue(
        buildItem({ targetType: 'EXTERNAL_URL', pageId: null, url: 'https://example.com' })
      );

      await service.createMenuItem(
        'menu-1',
        { label: 'External', targetType: 'EXTERNAL_URL', url: 'https://example.com' } as never,
        actor
      );

      expect(repository.createItem).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'https://example.com' })
      );
    });
  });

  describe('updateMenuItem', () => {
    it('throws MenuItemNotFoundException when the item does not belong to the menu', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findItemById as jest.Mock).mockResolvedValue(buildItem({ menuId: 'other-menu' }));

      await expect(service.updateMenuItem('menu-1', 'item-1', {} as never, actor)).rejects.toThrow(
        MenuItemNotFoundException
      );
    });

    it('rejects an item reparented onto itself', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findItemById as jest.Mock).mockResolvedValue(buildItem());

      await expect(
        service.updateMenuItem('menu-1', 'item-1', { parentId: 'item-1' } as never, actor)
      ).rejects.toThrow(SelfParentMenuItemException);
    });

    it('rejects a reparent that would create a circular reference', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findItemById as jest.Mock)
        .mockResolvedValueOnce(buildItem({ id: 'a' })) // getMenuItemOrThrow
        .mockResolvedValueOnce(buildItem({ id: 'b', parentId: 'a' })); // parent lookup
      (repository.findItemsByMenuId as jest.Mock).mockResolvedValue([
        buildItem({ id: 'a', parentId: null }),
        buildItem({ id: 'b', parentId: 'a' }),
      ]);

      await expect(
        service.updateMenuItem('menu-1', 'a', { parentId: 'b' } as never, actor)
      ).rejects.toThrow(CircularMenuItemParentException);
    });

    it('re-validates the target when targetType changes', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findItemById as jest.Mock).mockResolvedValue(buildItem());
      (repository.updateItem as jest.Mock).mockResolvedValue(
        buildItem({ targetType: 'EXTERNAL_URL', url: 'https://x.com' })
      );

      await service.updateMenuItem(
        'menu-1',
        'item-1',
        { targetType: 'EXTERNAL_URL', url: 'https://x.com' } as never,
        actor
      );

      expect(repository.updateItem).toHaveBeenCalledWith(
        'item-1',
        expect.objectContaining({ targetType: 'EXTERNAL_URL', url: 'https://x.com' })
      );
    });
  });

  describe('deleteMenuItem', () => {
    it('rejects deleting an item that still has active children', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findItemById as jest.Mock).mockResolvedValue(buildItem());
      (repository.countActiveChildren as jest.Mock).mockResolvedValue(2);

      await expect(service.deleteMenuItem('menu-1', 'item-1', actor)).rejects.toThrow(
        MenuItemInUseException
      );
    });

    it('soft-deletes a leaf item', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findItemById as jest.Mock).mockResolvedValue(buildItem());
      (repository.countActiveChildren as jest.Mock).mockResolvedValue(0);
      (repository.softDeleteItem as jest.Mock).mockResolvedValue(
        buildItem({ deletedAt: new Date() })
      );

      await service.deleteMenuItem('menu-1', 'item-1', actor);

      expect(repository.softDeleteItem).toHaveBeenCalledWith('item-1', actor.id);
    });
  });

  describe('reorderMenuItems', () => {
    it('rejects an entry whose id does not belong to the menu', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findItemsByMenuId as jest.Mock).mockResolvedValue([buildItem({ id: 'a' })]);

      await expect(
        service.reorderMenuItems(
          'menu-1',
          { items: [{ id: 'missing', sortOrder: 0 }] } as never,
          actor
        )
      ).rejects.toThrow(MenuItemNotFoundException);
    });

    it('rejects a reorder entry that would create a circular reference', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findItemsByMenuId as jest.Mock).mockResolvedValue([
        buildItem({ id: 'a', parentId: null }),
        buildItem({ id: 'b', parentId: 'a' }),
      ]);

      await expect(
        service.reorderMenuItems(
          'menu-1',
          { items: [{ id: 'a', parentId: 'b', sortOrder: 0 }] } as never,
          actor
        )
      ).rejects.toThrow(CircularMenuItemParentException);
    });

    it('applies a valid reorder in one repository call', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildMenu());
      (repository.findItemsByMenuId as jest.Mock).mockResolvedValue([
        buildItem({ id: 'a', parentId: null }),
        buildItem({ id: 'b', parentId: null }),
      ]);

      await service.reorderMenuItems(
        'menu-1',
        {
          items: [
            { id: 'a', sortOrder: 1 },
            { id: 'b', sortOrder: 0 },
          ],
        } as never,
        actor
      );

      expect(repository.reorderItems).toHaveBeenCalledWith([
        { id: 'a', parentId: null, sortOrder: 1 },
        { id: 'b', parentId: null, sortOrder: 0 },
      ]);
    });
  });
});
