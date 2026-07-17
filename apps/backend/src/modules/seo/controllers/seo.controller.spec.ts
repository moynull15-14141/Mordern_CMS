import { SeoService } from '../services/seo.service';
import { SeoController } from './seo.controller';

function buildController() {
  const seoService = {
    createSeo: jest.fn().mockResolvedValue({}),
    upsertSeo: jest.fn().mockResolvedValue({}),
    previewSeo: jest.fn().mockResolvedValue({}),
    validateSeoInput: jest.fn().mockResolvedValue({}),
    getSeoForArticle: jest.fn().mockResolvedValue({}),
    getSeoForCategory: jest.fn().mockResolvedValue({}),
    getSeo: jest.fn().mockResolvedValue({}),
    updateSeo: jest.fn().mockResolvedValue({}),
    deleteSeo: jest.fn().mockResolvedValue({}),
    restoreSeo: jest.fn().mockResolvedValue({}),
  } as unknown as SeoService;
  const controller = new SeoController(seoService);
  return { controller, seoService };
}

const user = { id: 'user-1' } as never;

describe('SeoController', () => {
  it('createSeo delegates with dto and actor', async () => {
    const { controller, seoService } = buildController();
    const dto = { siteId: 'site-1', title: 'x' } as never;
    await controller.createSeo(dto, user);
    expect(seoService.createSeo).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('upsertSeo delegates with dto and actor', async () => {
    const { controller, seoService } = buildController();
    const dto = { siteId: 'site-1' } as never;
    await controller.upsertSeo(dto, user);
    expect(seoService.upsertSeo).toHaveBeenCalledWith(dto, { id: 'user-1' });
  });

  it('previewSeo delegates with dto only (no actor)', async () => {
    const { controller, seoService } = buildController();
    const dto = { title: 'x' } as never;
    await controller.previewSeo(dto);
    expect(seoService.previewSeo).toHaveBeenCalledWith(dto);
  });

  it('validateSeo delegates with dto only (no actor)', async () => {
    const { controller, seoService } = buildController();
    const dto = { title: 'x' } as never;
    await controller.validateSeo(dto);
    expect(seoService.validateSeoInput).toHaveBeenCalledWith(dto);
  });

  it('getSeoForArticle delegates with the article id', async () => {
    const { controller, seoService } = buildController();
    await controller.getSeoForArticle('article-1');
    expect(seoService.getSeoForArticle).toHaveBeenCalledWith('article-1');
  });

  it('getSeoForCategory delegates with the category id', async () => {
    const { controller, seoService } = buildController();
    await controller.getSeoForCategory('category-1');
    expect(seoService.getSeoForCategory).toHaveBeenCalledWith('category-1');
  });

  it('getSeo delegates with the id', async () => {
    const { controller, seoService } = buildController();
    await controller.getSeo('seo-1');
    expect(seoService.getSeo).toHaveBeenCalledWith('seo-1');
  });

  it('updateSeo delegates with id, dto, and actor', async () => {
    const { controller, seoService } = buildController();
    const dto = { title: 'edited' } as never;
    await controller.updateSeo('seo-1', dto, user);
    expect(seoService.updateSeo).toHaveBeenCalledWith('seo-1', dto, { id: 'user-1' });
  });

  it('deleteSeo delegates with id and actor', async () => {
    const { controller, seoService } = buildController();
    await controller.deleteSeo('seo-1', user);
    expect(seoService.deleteSeo).toHaveBeenCalledWith('seo-1', { id: 'user-1' });
  });

  it('restoreSeo delegates with id and actor', async () => {
    const { controller, seoService } = buildController();
    await controller.restoreSeo('seo-1', user);
    expect(seoService.restoreSeo).toHaveBeenCalledWith('seo-1', { id: 'user-1' });
  });
});
