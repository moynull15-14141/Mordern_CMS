import { PublicMenusService } from '../services/public-menus.service';
import { PublicMenusController } from './public-menus.controller';

function buildController() {
  const publicMenusService = {
    getMenuByLocation: jest.fn().mockResolvedValue({}),
    getMenuBySlug: jest.fn().mockResolvedValue({}),
  } as unknown as PublicMenusService;
  const controller = new PublicMenusController(publicMenusService);
  return { controller, publicMenusService };
}

describe('PublicMenusController', () => {
  it('getMenuBySlug delegates with the slug param', async () => {
    const { controller, publicMenusService } = buildController();
    await controller.getMenuBySlug('header');
    expect(publicMenusService.getMenuBySlug).toHaveBeenCalledWith('header');
  });

  it('getMenuByLocation delegates with the location param', async () => {
    const { controller, publicMenusService } = buildController();
    await controller.getMenuByLocation('header');
    expect(publicMenusService.getMenuByLocation).toHaveBeenCalledWith('header');
  });

  it('getMenuByLocation does not call getMenuBySlug for a location literally named "slug"', async () => {
    // Guards against the route-ordering regression this controller's
    // comment warns about — "slug" as a *location* value must still reach
    // getMenuByLocation, not be swallowed by the slug/:slug route (which
    // only fires for /public/menus/slug/<something>, a different path).
    const { controller, publicMenusService } = buildController();
    await controller.getMenuByLocation('slug');
    expect(publicMenusService.getMenuByLocation).toHaveBeenCalledWith('slug');
    expect(publicMenusService.getMenuBySlug).not.toHaveBeenCalled();
  });
});
