import { ContentStatus } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PagesRepository, PageWithRelations } from '../repositories/pages.repository';
import { PagesValidator } from '../validators/pages.validator';
import { PagesMapper } from '../mappers/pages.mapper';
import {
  PageAlreadyDeletedException,
  PageInvalidStatusTransitionException,
  PageNotDeletedException,
  PageNotFoundException,
  PageSlugConflictException,
} from '../exceptions/page.exceptions';
import { PagesService } from './pages.service';

function buildPage(overrides: Partial<PageWithRelations> = {}): PageWithRelations {
  return {
    id: 'page-1',
    siteId: 'site-1',
    title: 'About Us',
    slug: 'about-us',
    body: { text: 'hello' },
    status: ContentStatus.DRAFT,
    seoMetaId: null,
    publishedAt: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    seoMeta: null,
    ...overrides,
  } as PageWithRelations;
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    findBySlug: jest.fn().mockResolvedValue(null),
    findBySlugWithRelations: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    upsertSeoMeta: jest.fn().mockResolvedValue('seo-1'),
  } as unknown as PagesRepository;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new PagesService(
    repository,
    new PagesValidator(),
    new PagesMapper(),
    auditLogger
  );

  return { service, repository };
}

const actor = { id: 'user-1' };

describe('PagesService', () => {
  describe('createPage', () => {
    it('auto-generates and uniquifies a slug from the title when none is given', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock)
        .mockResolvedValueOnce({ id: 'other' })
        .mockResolvedValueOnce(null);
      (repository.create as jest.Mock).mockResolvedValue(buildPage({ slug: 'about-us-2' }));

      await service.createPage({ title: 'About Us', body: {} } as never, actor);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'about-us-2' })
      );
    });

    it('rejects a manually-provided slug that is already taken', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock).mockResolvedValue({ id: 'other' });

      await expect(
        service.createPage({ title: 'About Us', slug: 'about-us', body: {} } as never, actor)
      ).rejects.toThrow(PageSlugConflictException);
    });

    it('upserts SeoMeta and connects it when seo is provided', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildPage());

      await service.createPage(
        { title: 'About Us', body: {}, seo: { title: 'SEO Title' } } as never,
        actor
      );

      expect(repository.upsertSeoMeta).toHaveBeenCalledWith(
        null,
        'site-1',
        { title: 'SEO Title' },
        actor.id
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ seoMeta: { connect: { id: 'seo-1' } } })
      );
    });
  });

  describe('updatePage', () => {
    it('rejects setting status to PUBLISHED via the generic update', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPage());

      await expect(
        service.updatePage('page-1', { status: ContentStatus.PUBLISHED } as never, actor)
      ).rejects.toThrow(PageInvalidStatusTransitionException);
    });

    it('throws PageNotFoundException when the page does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.updatePage('missing', {} as never, actor)).rejects.toThrow(
        PageNotFoundException
      );
    });
  });

  describe('deletePage / restorePage', () => {
    it('rejects deleting an already-deleted page', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPage({ deletedAt: new Date() }));

      await expect(service.deletePage('page-1', actor)).rejects.toThrow(
        PageAlreadyDeletedException
      );
    });

    it('rejects restoring a page that is not deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPage({ deletedAt: null }));

      await expect(service.restorePage('page-1', actor)).rejects.toThrow(PageNotDeletedException);
    });
  });

  describe('publishPage', () => {
    it('sets status to PUBLISHED and stamps publishedAt when not already set', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPage({ publishedAt: null }));
      (repository.update as jest.Mock).mockResolvedValue(
        buildPage({ status: ContentStatus.PUBLISHED, publishedAt: new Date('2026-02-01') })
      );

      const result = await service.publishPage('page-1', actor);

      expect(repository.update).toHaveBeenCalledWith(
        'page-1',
        expect.objectContaining({ status: ContentStatus.PUBLISHED })
      );
      expect(result.status).toBe(ContentStatus.PUBLISHED);
    });

    it('preserves the original publishedAt when re-publishing an already-published page', async () => {
      const { service, repository } = buildService();
      const originalDate = new Date('2026-01-15');
      (repository.findById as jest.Mock).mockResolvedValue(
        buildPage({ status: ContentStatus.PUBLISHED, publishedAt: originalDate })
      );
      (repository.update as jest.Mock).mockResolvedValue(buildPage());

      await service.publishPage('page-1', actor);

      expect(repository.update).toHaveBeenCalledWith(
        'page-1',
        expect.objectContaining({ publishedAt: originalDate })
      );
    });

    it('rejects publishing a soft-deleted page (findById excludes it by default)', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.publishPage('page-1', actor)).rejects.toThrow(PageNotFoundException);
    });
  });

  describe('getPage / getPageBySlug', () => {
    it('getPage throws PageNotFoundException when the page does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getPage('missing')).rejects.toThrow(PageNotFoundException);
    });

    it('getPageBySlug throws PageNotFoundException when no page matches the slug', async () => {
      const { service, repository } = buildService();
      (repository.findBySlugWithRelations as jest.Mock).mockResolvedValue(null);
      await expect(service.getPageBySlug('missing')).rejects.toThrow(PageNotFoundException);
    });
  });

  describe('updatePage — slug re-resolution', () => {
    it('leaves the slug untouched when the update does not change it', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPage());
      (repository.update as jest.Mock).mockResolvedValue(buildPage());

      await service.updatePage('page-1', { title: 'New Title' } as never, actor);

      expect(repository.findBySlug).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(
        'page-1',
        expect.objectContaining({ slug: undefined })
      );
    });

    it('re-validates and re-uniquifies the slug when it changes', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPage());
      (repository.findBySlug as jest.Mock).mockResolvedValue(null);
      (repository.update as jest.Mock).mockResolvedValue(buildPage({ slug: 'new-slug' }));

      await service.updatePage('page-1', { slug: 'new-slug' } as never, actor);

      expect(repository.findBySlug).toHaveBeenCalledWith('new-slug', 'site-1', 'page-1');
      expect(repository.update).toHaveBeenCalledWith(
        'page-1',
        expect.objectContaining({ slug: 'new-slug' })
      );
    });
  });
});
