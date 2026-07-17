import { ArticleVisibility, ContentStatus } from '@prisma/client';
import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { ArticlesRepository, ArticleWithRelations } from '../repositories/articles.repository';
import { ArticlesValidator } from '../validators/articles.validator';
import { ArticlesMapper } from '../mappers/articles.mapper';
import {
  ArticleAlreadyDeletedException,
  ArticleNotDeletedException,
  ArticleNotFoundException,
  ArticleRevisionNotFoundException,
  AuthorNotFoundException,
  SlugConflictException,
} from '../exceptions/article.exceptions';
import { ArticlesService } from './articles.service';

function buildArticle(overrides: Partial<ArticleWithRelations> = {}): ArticleWithRelations {
  return {
    id: 'article-1',
    siteId: 'site-1',
    authorId: 'author-1',
    primaryCategoryId: null,
    title: 'Hello World',
    subtitle: null,
    slug: 'hello-world',
    summary: null,
    body: { text: 'hello' },
    status: ContentStatus.DRAFT,
    publishedAt: null,
    scheduledAt: null,
    canonicalUrl: null,
    visibility: ArticleVisibility.PUBLIC,
    language: 'en',
    locale: 'en-US',
    seoMetaId: null,
    featuredMediaId: null,
    readingTime: null,
    wordCount: null,
    notes: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    author: { id: 'author-1', penName: 'A. Writer', userId: 'user-1' } as never,
    primaryCategory: null,
    seoMeta: null,
    tags: [],
    ...overrides,
  } as ArticleWithRelations;
}

function buildService() {
  const repository = {
    findAuthorById: jest.fn().mockResolvedValue({ id: 'author-1' }),
    findCategoryById: jest.fn().mockResolvedValue({ id: 'cat-1' }),
    findTagsByIds: jest.fn().mockResolvedValue([]),
    findMediaAssetById: jest.fn().mockResolvedValue({ id: 'media-1' }),
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    findBySlug: jest.fn().mockResolvedValue(null),
    findBySlugWithRelations: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    setTags: jest.fn(),
    upsertSeoMeta: jest.fn().mockResolvedValue('seo-1'),
    getMaxRevisionVersion: jest.fn().mockResolvedValue(0),
    createRevision: jest.fn(),
    findRevisions: jest.fn().mockResolvedValue([]),
    findRevision: jest.fn(),
    transaction: jest.fn((fn: (tx: undefined) => unknown) => fn(undefined)),
  } as unknown as ArticlesRepository;

  const authorizationService = {
    resolveEffectiveRoles: jest.fn().mockResolvedValue([SystemRole.SUPER_ADMIN]),
  } as unknown as AuthorizationService;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new ArticlesService(
    repository,
    new ArticlesValidator(),
    new ArticlesMapper(),
    authorizationService,
    auditLogger
  );

  return { service, repository, authorizationService };
}

const actor = { id: 'user-1' };

describe('ArticlesService', () => {
  describe('createArticle', () => {
    it('rejects when the given author does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findAuthorById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createArticle(
          { title: 'T', body: {}, authorId: 'missing', language: 'en', locale: 'en-US' } as never,
          actor
        )
      ).rejects.toThrow(AuthorNotFoundException);
    });

    it('auto-generates and uniquifies a slug from the title when none is given', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock)
        .mockResolvedValueOnce({ id: 'other' })
        .mockResolvedValueOnce(null);
      (repository.create as jest.Mock).mockResolvedValue(buildArticle());
      await service.createArticle(
        {
          title: 'Hello World',
          body: {},
          authorId: 'author-1',
          language: 'en',
          locale: 'en-US',
        } as never,
        actor
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'hello-world-2' }),
        undefined
      );
    });

    it('rejects an explicitly-provided slug that is already taken', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock).mockResolvedValue({ id: 'other' });
      await expect(
        service.createArticle(
          {
            title: 'Hello World',
            slug: 'taken-slug',
            body: {},
            authorId: 'author-1',
            language: 'en',
            locale: 'en-US',
          } as never,
          actor
        )
      ).rejects.toThrow(SlugConflictException);
    });

    it('creates the article, its initial revision, and sets tags', async () => {
      const { service, repository } = buildService();
      (repository.findTagsByIds as jest.Mock).mockResolvedValue([{ id: 'tag-1' }]);
      const created = buildArticle();
      (repository.create as jest.Mock).mockResolvedValue(created);
      (repository.findById as jest.Mock).mockResolvedValue(created);
      await service.createArticle(
        {
          title: 'Hello World',
          body: {},
          authorId: 'author-1',
          tagIds: ['tag-1'],
          language: 'en',
          locale: 'en-US',
        } as never,
        actor
      );
      expect(repository.setTags).toHaveBeenCalledWith('article-1', ['tag-1'], undefined, undefined);
      expect(repository.createRevision).toHaveBeenCalledWith(
        expect.objectContaining({ version: 1, comment: 'Initial version' }),
        undefined
      );
    });
  });

  describe('getArticle', () => {
    it('throws ArticleNotFoundException when missing', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getArticle('missing')).rejects.toThrow(ArticleNotFoundException);
    });
  });

  describe('updateArticle', () => {
    it('denies update when the actor has no edit access', async () => {
      const { service, repository, authorizationService } = buildService();
      (authorizationService.resolveEffectiveRoles as jest.Mock).mockResolvedValue([
        SystemRole.SUBSCRIBER,
      ]);
      (repository.findById as jest.Mock).mockResolvedValue(buildArticle());
      await expect(
        service.updateArticle('article-1', { title: 'New' } as never, actor)
      ).rejects.toThrow();
    });

    it('rejects setting status to PUBLISHED via the generic update', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildArticle());
      await expect(
        service.updateArticle('article-1', { status: ContentStatus.PUBLISHED } as never, actor)
      ).rejects.toThrow();
    });

    it('snapshots a revision before applying the update', async () => {
      const { service, repository } = buildService();
      const existing = buildArticle();
      (repository.findById as jest.Mock).mockResolvedValue(existing);
      (repository.update as jest.Mock).mockResolvedValue(buildArticle({ title: 'Updated' }));
      await service.updateArticle('article-1', { title: 'Updated' } as never, actor);
      expect(repository.createRevision).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Hello World', version: 1 }),
        undefined
      );
      expect(repository.update).toHaveBeenCalledWith(
        'article-1',
        expect.objectContaining({ title: 'Updated' })
      );
    });
  });

  describe('deleteArticle / restoreArticle', () => {
    it('rejects deleting an already-deleted article', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildArticle({ deletedAt: new Date() }));
      await expect(service.deleteArticle('article-1', actor)).rejects.toThrow(
        ArticleAlreadyDeletedException
      );
    });

    it('soft-deletes when allowed', async () => {
      const { service, repository } = buildService();
      const existing = buildArticle();
      (repository.findById as jest.Mock).mockResolvedValue(existing);
      await service.deleteArticle('article-1', actor);
      expect(repository.softDelete).toHaveBeenCalledWith('article-1', 'user-1');
    });

    it('rejects restoring a non-deleted article', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildArticle());
      await expect(service.restoreArticle('article-1', actor)).rejects.toThrow(
        ArticleNotDeletedException
      );
    });

    it('restores a deleted article when allowed', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildArticle({ deletedAt: new Date() }));
      await service.restoreArticle('article-1', actor);
      expect(repository.restore).toHaveBeenCalledWith('article-1', 'user-1');
    });
  });

  describe('publishArticle / scheduleArticle', () => {
    it('publishes and preserves an existing publishedAt on republish', async () => {
      const { service, repository } = buildService();
      const publishedAt = new Date('2025-01-01');
      (repository.findById as jest.Mock).mockResolvedValue(buildArticle({ publishedAt }));
      (repository.update as jest.Mock).mockResolvedValue(
        buildArticle({ status: ContentStatus.PUBLISHED, publishedAt })
      );
      await service.publishArticle('article-1', actor);
      expect(repository.update).toHaveBeenCalledWith(
        'article-1',
        expect.objectContaining({ status: ContentStatus.PUBLISHED, publishedAt })
      );
    });

    it('rejects scheduling in the past', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildArticle());
      await expect(
        service.scheduleArticle('article-1', { scheduledAt: '2020-01-01T00:00:00.000Z' }, actor)
      ).rejects.toThrow();
    });

    it('schedules a future date', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildArticle());
      (repository.update as jest.Mock).mockResolvedValue(
        buildArticle({ status: ContentStatus.SCHEDULED })
      );
      const future = new Date(Date.now() + 86_400_000).toISOString();
      await service.scheduleArticle('article-1', { scheduledAt: future }, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'article-1',
        expect.objectContaining({ status: ContentStatus.SCHEDULED })
      );
    });
  });

  describe('revisions', () => {
    it('compareRevisions throws when a version is missing', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildArticle());
      (repository.findRevision as jest.Mock).mockResolvedValueOnce({
        version: 1,
        title: 't',
        summary: null,
        body: {},
        status: ContentStatus.DRAFT,
        authorId: 'author-1',
        comment: null,
        createdAt: new Date(),
      });
      (repository.findRevision as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.compareRevisions('article-1', 1, 2)).rejects.toThrow(
        ArticleRevisionNotFoundException
      );
    });

    it('restoreRevision applies a past revision as a new update and snapshots first', async () => {
      const { service, repository } = buildService();
      const existing = buildArticle();
      (repository.findById as jest.Mock).mockResolvedValue(existing);
      (repository.findRevision as jest.Mock).mockResolvedValue({
        version: 1,
        title: 'Old Title',
        summary: 'Old summary',
        body: { text: 'old' },
        status: ContentStatus.DRAFT,
        authorId: 'author-1',
        comment: null,
        createdAt: new Date(),
      });
      (repository.update as jest.Mock).mockResolvedValue(buildArticle({ title: 'Old Title' }));
      await service.restoreRevision('article-1', 1, actor);
      expect(repository.createRevision).toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(
        'article-1',
        expect.objectContaining({ title: 'Old Title', summary: 'Old summary' })
      );
    });
  });
});
