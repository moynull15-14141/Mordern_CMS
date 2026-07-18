import { MenuSortField } from '../constants/menu.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { MenusService } from '../services/menus.service';
import { MenusController } from './menus.controller';

function buildController() {
  const menusService = {
    listMenus: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getMenuBySlug: jest.fn().mockResolvedValue({}),
    getMenu: jest.fn().mockResolvedValue({}),
    createMenu: jest.fn().mockResolvedValue({}),
    updateMenu: jest.fn().mockResolvedValue({}),
    deleteMenu: jest.fn().mockResolvedValue({}),
    restoreMenu: jest.fn().mockResolvedValue({}),
    createMenuItem: jest.fn().mockResolvedValue({}),
    updateMenuItem: jest.fn().mockResolvedValue({}),
    deleteMenuItem: jest.fn().mockResolvedValue({}),
    reorderMenuItems: jest.fn().mockResolvedValue(undefined),
  } as unknown as MenusService;
  const controller = new MenusController(menusService);
  return { controller, menusService };
}

const user = { id: 'user-1' } as never;

describe('MenusController', () => {
  it('listMenus builds query options and delegates to the service', async () => {
    const { controller, menusService } = buildController();
    await controller.listMenus({
      page: 1,
      limit: 20,
      sortBy: MenuSortField.NAME,
      sortOrder: SortOrder.ASC,
    } as never);
    expect(menusService.listMenus).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortBy: MenuSortField.NAME,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('listMenus forwards status and location filters', async () => {
    const { controller, menusService } = buildController();
    await controller.listMenus({
      page: 1,
      limit: 20,
      status: 'PUBLISHED',
      location: 'header',
      sortBy: MenuSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    } as never);
    expect(menusService.listMenus).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { status: 'PUBLISHED', location: 'header', search: undefined },
      })
    );
  });

  it('getMenuBySlug delegates with the slug param', async () => {
    const { controller, menusService } = buildController();
    await controller.getMenuBySlug('header');
    expect(menusService.getMenuBySlug).toHaveBeenCalledWith('header');
  });

  it('getMenu delegates with the id param', async () => {
    const { controller, menusService } = buildController();
    await controller.getMenu('menu-1');
    expect(menusService.getMenu).toHaveBeenCalledWith('menu-1');
  });

  it('createMenu passes the current user id as actor', async () => {
    const { controller, menusService } = buildController();
    const dto = { name: 'Header' } as never;
    await controller.createMenu(dto, user);
    expect(menusService.createMenu).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updateMenu passes id, dto, and actor', async () => {
    const { controller, menusService } = buildController();
    const dto = { name: 'New Name' } as never;
    await controller.updateMenu('menu-1', dto, user);
    expect(menusService.updateMenu).toHaveBeenCalledWith('menu-1', dto, { id: 'user-1' });
  });

  it('deleteMenu delegates with id and actor', async () => {
    const { controller, menusService } = buildController();
    await controller.deleteMenu('menu-1', user);
    expect(menusService.deleteMenu).toHaveBeenCalledWith('menu-1', { id: 'user-1' });
  });

  it('restoreMenu delegates with id and actor', async () => {
    const { controller, menusService } = buildController();
    await controller.restoreMenu('menu-1', user);
    expect(menusService.restoreMenu).toHaveBeenCalledWith('menu-1', { id: 'user-1' });
  });

  it('createMenuItem passes menu id, dto, and actor', async () => {
    const { controller, menusService } = buildController();
    const dto = { label: 'Home', targetType: 'PAGE', pageId: 'page-1' } as never;
    await controller.createMenuItem('menu-1', dto, user);
    expect(menusService.createMenuItem).toHaveBeenCalledWith('menu-1', dto, { id: 'user-1' });
  });

  it('updateMenuItem passes menu id, item id, dto, and actor', async () => {
    const { controller, menusService } = buildController();
    const dto = { label: 'New Label' } as never;
    await controller.updateMenuItem('menu-1', 'item-1', dto, user);
    expect(menusService.updateMenuItem).toHaveBeenCalledWith('menu-1', 'item-1', dto, {
      id: 'user-1',
    });
  });

  it('deleteMenuItem passes menu id, item id, and actor', async () => {
    const { controller, menusService } = buildController();
    await controller.deleteMenuItem('menu-1', 'item-1', user);
    expect(menusService.deleteMenuItem).toHaveBeenCalledWith('menu-1', 'item-1', { id: 'user-1' });
  });

  it('reorderMenuItems reorders then returns the refreshed menu tree', async () => {
    const { controller, menusService } = buildController();
    const dto = { items: [{ id: 'item-1', sortOrder: 0 }] } as never;
    (menusService.getMenu as jest.Mock).mockResolvedValue({ id: 'menu-1' });

    const result = await controller.reorderMenuItems('menu-1', dto, user);

    expect(menusService.reorderMenuItems).toHaveBeenCalledWith('menu-1', dto, { id: 'user-1' });
    expect(menusService.getMenu).toHaveBeenCalledWith('menu-1');
    expect(result).toEqual({ id: 'menu-1' });
  });
});
