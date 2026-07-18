import { PageSortField } from '../constants/page.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PagesService } from '../services/pages.service';
import { PagesController } from './pages.controller';

function buildController() {
  const pagesService = {
    listPages: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getPageBySlug: jest.fn().mockResolvedValue({}),
    getPage: jest.fn().mockResolvedValue({}),
    createPage: jest.fn().mockResolvedValue({}),
    updatePage: jest.fn().mockResolvedValue({}),
    deletePage: jest.fn().mockResolvedValue({}),
    restorePage: jest.fn().mockResolvedValue({}),
    publishPage: jest.fn().mockResolvedValue({}),
  } as unknown as PagesService;
  const controller = new PagesController(pagesService);
  return { controller, pagesService };
}

const user = { id: 'user-1' } as never;

describe('PagesController', () => {
  it('listPages builds query options and delegates to the service', async () => {
    const { controller, pagesService } = buildController();
    await controller.listPages({
      page: 1,
      limit: 20,
      sortBy: PageSortField.TITLE,
      sortOrder: SortOrder.ASC,
    } as never);
    expect(pagesService.listPages).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortBy: PageSortField.TITLE,
        sortOrder: SortOrder.ASC,
      })
    );
  });

  it('listPages forwards status and search filters', async () => {
    const { controller, pagesService } = buildController();
    await controller.listPages({
      page: 1,
      limit: 20,
      status: 'DRAFT',
      search: 'about',
      sortBy: PageSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    } as never);
    expect(pagesService.listPages).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { status: 'DRAFT', search: 'about' } })
    );
  });

  it('getPageBySlug delegates with the slug param', async () => {
    const { controller, pagesService } = buildController();
    await controller.getPageBySlug('about-us');
    expect(pagesService.getPageBySlug).toHaveBeenCalledWith('about-us');
  });

  it('getPage delegates with the id param', async () => {
    const { controller, pagesService } = buildController();
    await controller.getPage('page-1');
    expect(pagesService.getPage).toHaveBeenCalledWith('page-1');
  });

  it('createPage passes the current user id as actor', async () => {
    const { controller, pagesService } = buildController();
    const dto = { title: 'About Us', body: {} } as never;
    await controller.createPage(dto, user);
    expect(pagesService.createPage).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updatePage passes id, dto, and actor', async () => {
    const { controller, pagesService } = buildController();
    const dto = { title: 'New Title' } as never;
    await controller.updatePage('page-1', dto, user);
    expect(pagesService.updatePage).toHaveBeenCalledWith('page-1', dto, { id: 'user-1' });
  });

  it('deletePage delegates with id and actor', async () => {
    const { controller, pagesService } = buildController();
    await controller.deletePage('page-1', user);
    expect(pagesService.deletePage).toHaveBeenCalledWith('page-1', { id: 'user-1' });
  });

  it('restorePage delegates with id and actor', async () => {
    const { controller, pagesService } = buildController();
    await controller.restorePage('page-1', user);
    expect(pagesService.restorePage).toHaveBeenCalledWith('page-1', { id: 'user-1' });
  });

  it('publishPage delegates with id and actor', async () => {
    const { controller, pagesService } = buildController();
    await controller.publishPage('page-1', user);
    expect(pagesService.publishPage).toHaveBeenCalledWith('page-1', { id: 'user-1' });
  });
});
