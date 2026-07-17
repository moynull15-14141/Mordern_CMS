import { CategorySortField } from '../constants/category.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { CategoriesService } from '../services/categories.service';
import { CategoriesController } from './categories.controller';

function buildController() {
  const categoriesService = {
    listCategories: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getTree: jest.fn().mockResolvedValue([]),
    getFlat: jest.fn().mockResolvedValue([]),
    getCategoryBySlug: jest.fn().mockResolvedValue({}),
    getCategory: jest.fn().mockResolvedValue({}),
    getChildren: jest.fn().mockResolvedValue([]),
    getDescendants: jest.fn().mockResolvedValue([]),
    getAncestors: jest.fn().mockResolvedValue([]),
    getBreadcrumb: jest.fn().mockResolvedValue([]),
    createCategory: jest.fn().mockResolvedValue({}),
    updateCategory: jest.fn().mockResolvedValue({}),
    moveCategory: jest.fn().mockResolvedValue({}),
    deleteCategory: jest.fn().mockResolvedValue({}),
    restoreCategory: jest.fn().mockResolvedValue({}),
  } as unknown as CategoriesService;
  const controller = new CategoriesController(categoriesService);
  return { controller, categoriesService };
}

const user = { id: 'user-1' } as never;

describe('CategoriesController', () => {
  it('listCategories builds query options and delegates to the service', async () => {
    const { controller, categoriesService } = buildController();
    await controller.listCategories({
      page: 1,
      limit: 20,
      sortBy: CategorySortField.NAME,
      sortOrder: SortOrder.ASC,
    } as never);
    expect(categoriesService.listCategories).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortBy: CategorySortField.NAME,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('getTree delegates to the service', async () => {
    const { controller, categoriesService } = buildController();
    await controller.getTree();
    expect(categoriesService.getTree).toHaveBeenCalled();
  });

  it('getCategoryBySlug delegates with the slug param', async () => {
    const { controller, categoriesService } = buildController();
    await controller.getCategoryBySlug('news');
    expect(categoriesService.getCategoryBySlug).toHaveBeenCalledWith('news');
  });

  it('getChildren delegates with the id param', async () => {
    const { controller, categoriesService } = buildController();
    await controller.getChildren('cat-1');
    expect(categoriesService.getChildren).toHaveBeenCalledWith('cat-1');
  });

  it('getBreadcrumb delegates with the id param', async () => {
    const { controller, categoriesService } = buildController();
    await controller.getBreadcrumb('cat-1');
    expect(categoriesService.getBreadcrumb).toHaveBeenCalledWith('cat-1');
  });

  it('createCategory passes the current user id as actor', async () => {
    const { controller, categoriesService } = buildController();
    const dto = { name: 'News' } as never;
    await controller.createCategory(dto, user);
    expect(categoriesService.createCategory).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updateCategory delegates with id, dto, and actor', async () => {
    const { controller, categoriesService } = buildController();
    const dto = { name: 'Updated' } as never;
    await controller.updateCategory('cat-1', dto, user);
    expect(categoriesService.updateCategory).toHaveBeenCalledWith('cat-1', dto, { id: 'user-1' });
  });

  it('moveCategory delegates with id, dto, and actor', async () => {
    const { controller, categoriesService } = buildController();
    const dto = { parentId: 'new-parent' };
    await controller.moveCategory('cat-1', dto, user);
    expect(categoriesService.moveCategory).toHaveBeenCalledWith('cat-1', dto, { id: 'user-1' });
  });

  it('deleteCategory delegates with id and actor', async () => {
    const { controller, categoriesService } = buildController();
    await controller.deleteCategory('cat-1', user);
    expect(categoriesService.deleteCategory).toHaveBeenCalledWith('cat-1', { id: 'user-1' });
  });

  it('restoreCategory delegates with id and actor', async () => {
    const { controller, categoriesService } = buildController();
    await controller.restoreCategory('cat-1', user);
    expect(categoriesService.restoreCategory).toHaveBeenCalledWith('cat-1', { id: 'user-1' });
  });
});
