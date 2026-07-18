import { ThemeSortField } from '../constants/theme.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { ThemesService } from '../services/themes.service';
import { ThemesController } from './themes.controller';

function buildController() {
  const themesService = {
    listThemes: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getActiveTheme: jest.fn().mockResolvedValue({}),
    getTheme: jest.fn().mockResolvedValue({}),
    createTheme: jest.fn().mockResolvedValue({}),
    updateTheme: jest.fn().mockResolvedValue({}),
    deleteTheme: jest.fn().mockResolvedValue({}),
    restoreTheme: jest.fn().mockResolvedValue({}),
    activateTheme: jest.fn().mockResolvedValue({}),
  } as unknown as ThemesService;
  const controller = new ThemesController(themesService);
  return { controller, themesService };
}

const user = { id: 'user-1' } as never;

describe('ThemesController', () => {
  it('listThemes builds query options and delegates to the service', async () => {
    const { controller, themesService } = buildController();
    await controller.listThemes({
      page: 1,
      limit: 20,
      sortBy: ThemeSortField.NAME,
      sortOrder: SortOrder.ASC,
    } as never);
    expect(themesService.listThemes).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortBy: ThemeSortField.NAME,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('listThemes forwards status and isActive filters', async () => {
    const { controller, themesService } = buildController();
    await controller.listThemes({
      page: 1,
      limit: 20,
      status: 'PUBLISHED',
      isActive: true,
      sortBy: ThemeSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    } as never);
    expect(themesService.listThemes).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: { status: 'PUBLISHED', isActive: true, search: undefined },
      })
    );
  });

  it('getActiveTheme delegates to the service with no arguments', async () => {
    const { controller, themesService } = buildController();
    await controller.getActiveTheme();
    expect(themesService.getActiveTheme).toHaveBeenCalledWith();
  });

  it('getTheme delegates with the id param', async () => {
    const { controller, themesService } = buildController();
    await controller.getTheme('theme-1');
    expect(themesService.getTheme).toHaveBeenCalledWith('theme-1');
  });

  it('createTheme passes the current user id as actor', async () => {
    const { controller, themesService } = buildController();
    const dto = { name: 'Classic' } as never;
    await controller.createTheme(dto, user);
    expect(themesService.createTheme).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updateTheme passes id, dto, and actor', async () => {
    const { controller, themesService } = buildController();
    const dto = { name: 'New Name' } as never;
    await controller.updateTheme('theme-1', dto, user);
    expect(themesService.updateTheme).toHaveBeenCalledWith('theme-1', dto, { id: 'user-1' });
  });

  it('deleteTheme delegates with id and actor', async () => {
    const { controller, themesService } = buildController();
    await controller.deleteTheme('theme-1', user);
    expect(themesService.deleteTheme).toHaveBeenCalledWith('theme-1', { id: 'user-1' });
  });

  it('restoreTheme delegates with id and actor', async () => {
    const { controller, themesService } = buildController();
    await controller.restoreTheme('theme-1', user);
    expect(themesService.restoreTheme).toHaveBeenCalledWith('theme-1', { id: 'user-1' });
  });

  it('activateTheme delegates with id and actor', async () => {
    const { controller, themesService } = buildController();
    await controller.activateTheme('theme-1', user);
    expect(themesService.activateTheme).toHaveBeenCalledWith('theme-1', { id: 'user-1' });
  });
});
