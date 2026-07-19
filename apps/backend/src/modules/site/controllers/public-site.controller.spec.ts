import { PublicSiteService } from '../services/public-site.service';
import { PublicSiteController } from './public-site.controller';

function buildController() {
  const publicSiteService = {
    getSite: jest.fn().mockResolvedValue({}),
  } as unknown as PublicSiteService;
  const controller = new PublicSiteController(publicSiteService);
  return { controller, publicSiteService };
}

describe('PublicSiteController', () => {
  it('getSite delegates to PublicSiteService', async () => {
    const { controller, publicSiteService } = buildController();
    await controller.getSite();
    expect(publicSiteService.getSite).toHaveBeenCalledWith();
  });
});
