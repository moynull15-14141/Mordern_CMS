import { BadRequestException } from '@nestjs/common';
import { PublicSeoService } from '../services/public-seo.service';
import { PublicSeoController } from './public-seo.controller';

function buildController() {
  const publicSeoService = {
    getSeoForEntity: jest.fn().mockResolvedValue({}),
  } as unknown as PublicSeoService;
  const controller = new PublicSeoController(publicSeoService);
  return { controller, publicSeoService };
}

describe('PublicSeoController', () => {
  it('getSeoForEntity delegates to PublicSeoService for a valid entity type', async () => {
    const { controller, publicSeoService } = buildController();
    await controller.getSeoForEntity('page', 'about-us');
    expect(publicSeoService.getSeoForEntity).toHaveBeenCalledWith('page', 'about-us');
  });

  it('getSeoForEntity delegates for "article" and "category" too', async () => {
    const { controller, publicSeoService } = buildController();
    await controller.getSeoForEntity('article', 'match-report');
    await controller.getSeoForEntity('category', 'football');
    expect(publicSeoService.getSeoForEntity).toHaveBeenCalledWith('article', 'match-report');
    expect(publicSeoService.getSeoForEntity).toHaveBeenCalledWith('category', 'football');
  });

  it('throws BadRequestException for an unrecognized entity type without calling the service', async () => {
    const { controller, publicSeoService } = buildController();
    await expect(controller.getSeoForEntity('menu', 'header')).rejects.toThrow(BadRequestException);
    expect(publicSeoService.getSeoForEntity).not.toHaveBeenCalled();
  });
});
