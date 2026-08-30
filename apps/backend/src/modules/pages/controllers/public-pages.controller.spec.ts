import { PublicPagesService } from '../services/public-pages.service';
import { PublicPagesController } from './public-pages.controller';
import { PublicPageQueryDto } from '../dto/public-page-query.dto';

function buildController() {
  const publicPagesService = {
    getPageBySlug: jest.fn().mockResolvedValue({}),
    getPageForPreview: jest.fn().mockResolvedValue({}),
    listPages: jest.fn().mockResolvedValue({ items: [], pagination: {} }),
  } as unknown as PublicPagesService;
  const controller = new PublicPagesController(publicPagesService);
  return { controller, publicPagesService };
}

describe('PublicPagesController', () => {
  it('listPages delegates the query object as-is', async () => {
    const { controller, publicPagesService } = buildController();
    const query = new PublicPageQueryDto();
    await controller.listPages(query);
    expect(publicPagesService.listPages).toHaveBeenCalledWith(query);
  });

  it('getPageBySlug delegates to PublicPagesService with the slug param', async () => {
    const { controller, publicPagesService } = buildController();
    await controller.getPageBySlug('about-us');
    expect(publicPagesService.getPageBySlug).toHaveBeenCalledWith('about-us');
  });

  it('getPageForPreview delegates to PublicPagesService with the token param', async () => {
    const { controller, publicPagesService } = buildController();
    await controller.getPageForPreview('a-token');
    expect(publicPagesService.getPageForPreview).toHaveBeenCalledWith('a-token');
  });
});
