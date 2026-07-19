import { PublicPagesService } from '../services/public-pages.service';
import { PublicPagesController } from './public-pages.controller';

function buildController() {
  const publicPagesService = {
    getPageBySlug: jest.fn().mockResolvedValue({}),
  } as unknown as PublicPagesService;
  const controller = new PublicPagesController(publicPagesService);
  return { controller, publicPagesService };
}

describe('PublicPagesController', () => {
  it('getPageBySlug delegates to PublicPagesService with the slug param', async () => {
    const { controller, publicPagesService } = buildController();
    await controller.getPageBySlug('about-us');
    expect(publicPagesService.getPageBySlug).toHaveBeenCalledWith('about-us');
  });
});
