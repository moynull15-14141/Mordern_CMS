import { NotFoundException } from '@nestjs/common';
import { PublicRedirectsService } from '../services/public-redirects.service';
import { PublicRedirectsController } from './public-redirects.controller';

function buildController() {
  const publicRedirectsService = {
    lookup: jest.fn(),
  } as unknown as PublicRedirectsService;
  const controller = new PublicRedirectsController(publicRedirectsService);
  return { controller, publicRedirectsService };
}

describe('PublicRedirectsController.lookup', () => {
  it('delegates to PublicRedirectsService and returns its result on a hit', async () => {
    const { controller, publicRedirectsService } = buildController();
    (publicRedirectsService.lookup as jest.Mock).mockResolvedValue({
      destinationUrl: '/about',
      redirectType: 301,
    });

    const result = await controller.lookup('/old-about');

    expect(publicRedirectsService.lookup).toHaveBeenCalledWith('/old-about');
    expect(result).toEqual({ destinationUrl: '/about', redirectType: 301 });
  });

  it('throws NotFoundException (a real 404) when no redirect matches', async () => {
    const { controller, publicRedirectsService } = buildController();
    (publicRedirectsService.lookup as jest.Mock).mockResolvedValue(null);

    await expect(controller.lookup('/nothing-here')).rejects.toThrow(NotFoundException);
  });
});
