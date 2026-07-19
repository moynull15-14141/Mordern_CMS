import { PublicCategoriesService } from '../services/public-categories.service';
import { PublicCategoriesController } from './public-categories.controller';
import { PublicCategoryQueryDto } from '../dto/public-category-query.dto';

function buildController() {
  const publicCategoriesService = {
    listCategories: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getCategoryBySlug: jest.fn().mockResolvedValue({}),
  } as unknown as PublicCategoriesService;
  const controller = new PublicCategoriesController(publicCategoriesService);
  return { controller, publicCategoriesService };
}

describe('PublicCategoriesController', () => {
  it('listCategories delegates the query object as-is', async () => {
    const { controller, publicCategoriesService } = buildController();
    const query = new PublicCategoryQueryDto();
    await controller.listCategories(query);
    expect(publicCategoriesService.listCategories).toHaveBeenCalledWith(query);
  });

  it('getCategoryBySlug delegates with the slug param', async () => {
    const { controller, publicCategoriesService } = buildController();
    await controller.getCategoryBySlug('football');
    expect(publicCategoriesService.getCategoryBySlug).toHaveBeenCalledWith('football');
  });
});
