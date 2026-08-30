import { RedirectsService } from '../services/redirects.service';
import { RedirectsController } from './redirects.controller';
import { RedirectQueryDto } from '../dto/redirect-query.dto';
import { CreateRedirectDto } from '../dto/create-redirect.dto';
import { UpdateRedirectDto } from '../dto/update-redirect.dto';

function buildController() {
  const redirectsService = {
    listRedirects: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
    getRedirect: jest.fn().mockResolvedValue({}),
    createRedirect: jest.fn().mockResolvedValue({}),
    updateRedirect: jest.fn().mockResolvedValue({}),
    deleteRedirect: jest.fn().mockResolvedValue({}),
    restoreRedirect: jest.fn().mockResolvedValue({}),
  } as unknown as RedirectsService;
  const controller = new RedirectsController(redirectsService);
  return { controller, redirectsService };
}

const user = { id: 'user-1' } as never;

describe('RedirectsController', () => {
  it('listRedirects maps the query DTO into filters/sort/pagination', async () => {
    const { controller, redirectsService } = buildController();
    const query = new RedirectQueryDto();
    query.search = 'about';
    await controller.listRedirects(query);
    expect(redirectsService.listRedirects).toHaveBeenCalledWith(
      expect.objectContaining({ filters: expect.objectContaining({ search: 'about' }) })
    );
  });

  it('getRedirect delegates with the id param', async () => {
    const { controller, redirectsService } = buildController();
    await controller.getRedirect('redirect-1');
    expect(redirectsService.getRedirect).toHaveBeenCalledWith('redirect-1');
  });

  it('createRedirect delegates the dto and the current user id', async () => {
    const { controller, redirectsService } = buildController();
    const dto: CreateRedirectDto = { sourcePath: '/old', destinationUrl: '/new' };
    await controller.createRedirect(dto, user);
    expect(redirectsService.createRedirect).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('updateRedirect delegates the id, dto, and current user id', async () => {
    const { controller, redirectsService } = buildController();
    const dto: UpdateRedirectDto = { redirectType: 302 };
    await controller.updateRedirect('redirect-1', dto, user);
    expect(redirectsService.updateRedirect).toHaveBeenCalledWith('redirect-1', dto, {
      id: 'user-1',
    });
  });

  it('deleteRedirect delegates the id and current user id', async () => {
    const { controller, redirectsService } = buildController();
    await controller.deleteRedirect('redirect-1', user);
    expect(redirectsService.deleteRedirect).toHaveBeenCalledWith('redirect-1', { id: 'user-1' });
  });

  it('restoreRedirect delegates the id and current user id', async () => {
    const { controller, redirectsService } = buildController();
    await controller.restoreRedirect('redirect-1', user);
    expect(redirectsService.restoreRedirect).toHaveBeenCalledWith('redirect-1', { id: 'user-1' });
  });
});
