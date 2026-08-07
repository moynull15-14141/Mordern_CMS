import { PatternStatus } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { SlugShapeValidator } from '../../categories/validators/slug-shape.validator';
import { BlockTreeValidator } from '../../content-blocks/validators/block-tree.validator';
import { BlockTreeSanitizer } from '../../content-blocks/sanitization/block-tree-sanitizer.service';
import { PatternRepository } from '../repositories/pattern.repository';
import { PatternMapper } from '../mappers/pattern.mapper';
import {
  PatternAlreadyArchivedException,
  PatternAlreadyDeletedException,
  PatternNotArchivedException,
  PatternNotDeletedException,
  PatternNotFoundException,
  PatternSlugConflictException,
} from '../exceptions/pattern.exceptions';
import { MediaAssetNotFoundException } from '../../media/exceptions/media.exceptions';
import { PatternsService } from './patterns.service';

function buildPattern(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pattern-1',
    siteId: 'site-1',
    name: 'Hero Banner',
    slug: 'hero-banner',
    description: null,
    category: 'Hero',
    tags: [],
    status: PatternStatus.ACTIVE,
    thumbnailMediaId: null,
    body: { blocks: [{ id: 'b1', type: 'heading', data: { text: 'Hi', level: '2' } }] },
    version: 1,
    createdAt: new Date('2026-01-01'),
    createdBy: 'user-1',
    updatedAt: new Date('2026-01-01'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as never;
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    findBySlug: jest.fn().mockResolvedValue(null),
    findMany: jest.fn(),
    mediaAssetExists: jest.fn().mockResolvedValue(true),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    findActivePageBodies: jest.fn().mockResolvedValue([]),
    findActiveArticleBodies: jest.fn().mockResolvedValue([]),
    findActiveReusableBlockBodies: jest.fn().mockResolvedValue([]),
  } as unknown as PatternRepository;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new PatternsService(
    repository,
    new PatternMapper(),
    new SlugShapeValidator(),
    new BlockTreeValidator(),
    new BlockTreeSanitizer(),
    auditLogger
  );

  return { service, repository };
}

const actor = { id: 'user-1' };
const validBody = { blocks: [{ id: 'b1', type: 'heading', data: { text: 'Hi', level: '2' } }] };

describe('PatternsService', () => {
  describe('createPattern', () => {
    it('rejects a malformed block tree', async () => {
      const { service } = buildService();
      await expect(
        service.createPattern({ name: 'Hero', body: { blocks: 'not-an-array' } } as never, actor)
      ).rejects.toThrow();
    });

    it('rejects a slug that is already taken', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock).mockResolvedValue(buildPattern());
      await expect(
        service.createPattern(
          { name: 'Hero', slug: 'hero-banner', body: validBody } as never,
          actor
        )
      ).rejects.toThrow(PatternSlugConflictException);
    });

    it('rejects a thumbnailMediaId that does not exist', async () => {
      const { service, repository } = buildService();
      (repository.mediaAssetExists as jest.Mock).mockResolvedValue(false);
      await expect(
        service.createPattern(
          { name: 'Hero', thumbnailMediaId: 'missing', body: validBody } as never,
          actor
        )
      ).rejects.toThrow(MediaAssetNotFoundException);
    });

    it('auto-generates a slug from the name when omitted', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildPattern());
      await service.createPattern({ name: 'Hero Banner', body: validBody } as never, actor);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'hero-banner' })
      );
    });

    it('creates with sanitized body, tags, and thumbnail connection', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildPattern());
      await service.createPattern(
        {
          name: 'Hero Banner',
          tags: ['landing', 'marketing'],
          thumbnailMediaId: 'media-1',
          body: validBody,
        } as never,
        actor
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Hero Banner',
          tags: ['landing', 'marketing'],
          thumbnailMedia: { connect: { id: 'media-1' } },
          createdBy: 'user-1',
          updatedBy: 'user-1',
        })
      );
    });
  });

  describe('getPattern', () => {
    it('throws PatternNotFoundException when missing', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getPattern('missing')).rejects.toThrow(PatternNotFoundException);
    });

    it('maps a found pattern', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      const result = await service.getPattern('pattern-1');
      expect(result.id).toBe('pattern-1');
      expect(result.body).toEqual(validBody);
    });
  });

  describe('listPatterns', () => {
    it('paginates results from the default site', async () => {
      const { service, repository } = buildService();
      (repository.findMany as jest.Mock).mockResolvedValue({ items: [buildPattern()], total: 1 });
      const result = await service.listPatterns({
        filters: {},
        sortBy: 'createdAt' as never,
        sortOrder: 'desc' as never,
        page: 1,
        limit: 20,
      });
      expect(repository.findMany).toHaveBeenCalledWith('site-1', expect.anything());
      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('updatePattern', () => {
    it('re-resolves the slug when the name changes', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      (repository.update as jest.Mock).mockResolvedValue(
        buildPattern({ name: 'New Hero', slug: 'new-hero' })
      );
      await service.updatePattern('pattern-1', { name: 'New Hero' } as never, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'pattern-1',
        expect.objectContaining({ name: 'New Hero', slug: 'new-hero' })
      );
    });

    it('re-validates and bumps version when body changes', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      (repository.update as jest.Mock).mockResolvedValue(buildPattern());
      await service.updatePattern('pattern-1', { body: validBody } as never, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'pattern-1',
        expect.objectContaining({ version: { increment: 1 } })
      );
    });

    it('does not bump version when body is unchanged', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      (repository.update as jest.Mock).mockResolvedValue(buildPattern());
      await service.updatePattern('pattern-1', { description: 'New description' } as never, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'pattern-1',
        expect.objectContaining({ version: undefined })
      );
    });

    it('rejects an invalid updated body', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      await expect(
        service.updatePattern(
          'pattern-1',
          { body: { blocks: [{ type: 'not-a-real-type', data: {} }] } } as never,
          actor
        )
      ).rejects.toThrow();
    });
  });

  describe('duplicatePattern', () => {
    it('creates a new pattern with a "(Copy)" name and an identical body', async () => {
      const { service, repository } = buildService();
      const source = buildPattern();
      (repository.findById as jest.Mock).mockResolvedValue(source);
      (repository.create as jest.Mock).mockResolvedValue(
        buildPattern({ id: 'pattern-2', name: 'Hero Banner (Copy)' })
      );

      const result = await service.duplicatePattern('pattern-1', actor);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Hero Banner (Copy)', body: source.body })
      );
      expect(result.id).toBe('pattern-2');
    });
  });

  describe('archive / unarchive', () => {
    it('archivePattern rejects an already-archived pattern', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(
        buildPattern({ status: PatternStatus.ARCHIVED })
      );
      await expect(service.archivePattern('pattern-1', actor)).rejects.toThrow(
        PatternAlreadyArchivedException
      );
    });

    it('archivePattern transitions ACTIVE -> ARCHIVED', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      (repository.updateStatus as jest.Mock).mockResolvedValue(
        buildPattern({ status: PatternStatus.ARCHIVED })
      );
      await service.archivePattern('pattern-1', actor);
      expect(repository.updateStatus).toHaveBeenCalledWith(
        'pattern-1',
        PatternStatus.ARCHIVED,
        'user-1'
      );
    });

    it('unarchivePattern rejects a non-archived pattern', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      await expect(service.unarchivePattern('pattern-1', actor)).rejects.toThrow(
        PatternNotArchivedException
      );
    });

    it('unarchivePattern transitions ARCHIVED -> ACTIVE', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(
        buildPattern({ status: PatternStatus.ARCHIVED })
      );
      (repository.updateStatus as jest.Mock).mockResolvedValue(buildPattern());
      await service.unarchivePattern('pattern-1', actor);
      expect(repository.updateStatus).toHaveBeenCalledWith(
        'pattern-1',
        PatternStatus.ACTIVE,
        'user-1'
      );
    });
  });

  describe('delete / restore', () => {
    it('deletePattern rejects an already-deleted pattern', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern({ deletedAt: new Date() }));
      await expect(service.deletePattern('pattern-1', actor)).rejects.toThrow(
        PatternAlreadyDeletedException
      );
    });

    it('deletePattern soft-deletes', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildPattern())
        .mockResolvedValueOnce(buildPattern({ deletedAt: new Date() }));
      await service.deletePattern('pattern-1', actor);
      expect(repository.softDelete).toHaveBeenCalledWith('pattern-1', 'user-1');
    });

    it('restorePattern rejects a non-deleted pattern', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      await expect(service.restorePattern('pattern-1', actor)).rejects.toThrow(
        PatternNotDeletedException
      );
    });

    it('restorePattern restores', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildPattern({ deletedAt: new Date() }))
        .mockResolvedValueOnce(buildPattern());
      await service.restorePattern('pattern-1', actor);
      expect(repository.restore).toHaveBeenCalledWith('pattern-1', 'user-1');
    });
  });

  describe('getUsages', () => {
    it('finds a page whose body was inserted from this pattern', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      (repository.findActivePageBodies as jest.Mock).mockResolvedValue([
        {
          id: 'page-1',
          title: 'Home',
          slug: 'home',
          body: {
            blocks: [
              {
                id: 'b1',
                type: 'heading',
                data: {},
                meta: { patternOrigin: { patternId: 'pattern-1' } },
              },
            ],
          },
        },
      ]);
      const usages = await service.getUsages('pattern-1');
      expect(usages).toEqual([{ contentType: 'page', id: 'page-1', title: 'Home', slug: 'home' }]);
    });

    it('finds an article whose body was inserted from this pattern', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      (repository.findActiveArticleBodies as jest.Mock).mockResolvedValue([
        {
          id: 'article-1',
          title: 'News',
          slug: 'news',
          body: {
            blocks: [
              {
                id: 'b1',
                type: 'heading',
                data: {},
                meta: { patternOrigin: { patternId: 'pattern-1' } },
              },
            ],
          },
        },
      ]);
      const usages = await service.getUsages('pattern-1');
      expect(usages).toEqual([
        { contentType: 'article', id: 'article-1', title: 'News', slug: 'news' },
      ]);
    });

    it('finds a reusable block whose body was inserted from this pattern', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      (repository.findActiveReusableBlockBodies as jest.Mock).mockResolvedValue([
        {
          id: 'rb-1',
          name: 'CTA',
          blockType: 'container',
          data: {},
          children: [
            {
              id: 'b1',
              type: 'heading',
              data: {},
              meta: { patternOrigin: { patternId: 'pattern-1' } },
            },
          ],
        },
      ]);
      const usages = await service.getUsages('pattern-1');
      expect(usages).toEqual([{ contentType: 'reusable-block', id: 'rb-1', title: 'CTA' }]);
    });

    it('does not report an unrelated body as a usage', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildPattern());
      (repository.findActivePageBodies as jest.Mock).mockResolvedValue([
        {
          id: 'page-1',
          title: 'Home',
          slug: 'home',
          body: { blocks: [{ id: 'b1', type: 'heading', data: {} }] },
        },
      ]);
      const usages = await service.getUsages('pattern-1');
      expect(usages).toEqual([]);
    });
  });
});
