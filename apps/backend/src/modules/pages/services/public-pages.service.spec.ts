import { ContentStatus } from '@prisma/client';
import { PagesService } from './pages.service';
import { PublicPagesMapper } from '../mappers/public-pages.mapper';
import { PublicPagesService } from './public-pages.service';
import { PagePreviewService } from './page-preview.service';
import { PageNotFoundException } from '../exceptions/page.exceptions';
import { PageResponseDto } from '../dto/page-response.dto';

function buildPageResponseDto(overrides: Partial<PageResponseDto> = {}): PageResponseDto {
  return {
    id: 'page-1',
    title: 'About Us',
    slug: 'about-us',
    body: {},
    status: ContentStatus.PUBLISHED,
    publishedAt: '2026-01-01T00:00:00.000Z',
    seo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

function buildService() {
  const pagesService = {
    getPageBySlug: jest.fn(),
    getPage: jest.fn(),
  } as unknown as PagesService;
  const pagePreviewService = {
    resolvePreviewToken: jest.fn(),
  } as unknown as PagePreviewService;
  const service = new PublicPagesService(pagesService, new PublicPagesMapper(), pagePreviewService);
  return { service, pagesService, pagePreviewService };
}

describe('PublicPagesService', () => {
  it('delegates to PagesService.getPageBySlug and returns the public shape', async () => {
    const { service, pagesService } = buildService();
    (pagesService.getPageBySlug as jest.Mock).mockResolvedValue(buildPageResponseDto());

    const result = await service.getPageBySlug('about-us');

    expect(pagesService.getPageBySlug).toHaveBeenCalledWith('about-us');
    expect(result.slug).toBe('about-us');
  });

  it('throws PageNotFoundException (not the underlying page) when the page is a DRAFT', async () => {
    const { service, pagesService } = buildService();
    (pagesService.getPageBySlug as jest.Mock).mockResolvedValue(
      buildPageResponseDto({ status: ContentStatus.DRAFT })
    );

    await expect(service.getPageBySlug('about-us')).rejects.toThrow(PageNotFoundException);
  });

  it('throws PageNotFoundException for REVIEW status', async () => {
    const { service, pagesService } = buildService();
    (pagesService.getPageBySlug as jest.Mock).mockResolvedValue(
      buildPageResponseDto({ status: ContentStatus.REVIEW })
    );

    await expect(service.getPageBySlug('about-us')).rejects.toThrow(PageNotFoundException);
  });

  it('throws PageNotFoundException for ARCHIVED status', async () => {
    const { service, pagesService } = buildService();
    (pagesService.getPageBySlug as jest.Mock).mockResolvedValue(
      buildPageResponseDto({ status: ContentStatus.ARCHIVED })
    );

    await expect(service.getPageBySlug('about-us')).rejects.toThrow(PageNotFoundException);
  });

  it('propagates PageNotFoundException when the underlying service throws (no such slug)', async () => {
    const { service, pagesService } = buildService();
    (pagesService.getPageBySlug as jest.Mock).mockRejectedValue(new PageNotFoundException('nope'));

    await expect(service.getPageBySlug('nope')).rejects.toThrow(PageNotFoundException);
  });

  it('never leaks internal id/audit fields in the resolved value', async () => {
    const { service, pagesService } = buildService();
    (pagesService.getPageBySlug as jest.Mock).mockResolvedValue(buildPageResponseDto());

    const result = (await service.getPageBySlug('about-us')) as unknown as Record<string, unknown>;

    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('createdAt');
    expect(result).not.toHaveProperty('deletedAt');
  });

  describe('resolvePublishedIdBySlug', () => {
    it('returns the id of a published page (used by the SEO composition endpoint)', async () => {
      const { service, pagesService } = buildService();
      (pagesService.getPageBySlug as jest.Mock).mockResolvedValue(
        buildPageResponseDto({ id: 'page-42' })
      );

      await expect(service.resolvePublishedIdBySlug('about-us')).resolves.toBe('page-42');
    });

    it('applies the same published-only gate as getPageBySlug', async () => {
      const { service, pagesService } = buildService();
      (pagesService.getPageBySlug as jest.Mock).mockResolvedValue(
        buildPageResponseDto({ status: ContentStatus.DRAFT })
      );

      await expect(service.resolvePublishedIdBySlug('about-us')).rejects.toThrow(
        PageNotFoundException
      );
    });
  });

  describe('getPageForPreview', () => {
    it('resolves the token to a page id and returns the public shape regardless of status', async () => {
      const { service, pagesService, pagePreviewService } = buildService();
      (pagePreviewService.resolvePreviewToken as jest.Mock).mockReturnValue('page-1');
      (pagesService.getPage as jest.Mock).mockResolvedValue(
        buildPageResponseDto({ status: ContentStatus.DRAFT })
      );

      const result = await service.getPageForPreview('a-valid-token');

      expect(pagePreviewService.resolvePreviewToken).toHaveBeenCalledWith('a-valid-token');
      expect(pagesService.getPage).toHaveBeenCalledWith('page-1');
      expect(result.slug).toBe('about-us');
    });

    it('propagates the underlying rejection for an invalid/expired token', async () => {
      const { service, pagesService, pagePreviewService } = buildService();
      (pagePreviewService.resolvePreviewToken as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.getPageForPreview('bad-token')).rejects.toThrow('invalid token');
      expect(pagesService.getPage).not.toHaveBeenCalled();
    });
  });
});
