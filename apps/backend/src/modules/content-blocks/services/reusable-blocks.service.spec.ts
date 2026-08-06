import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { ReusableBlockRepository } from '../repositories/reusable-block.repository';
import { ReusableBlockMapper } from '../mappers/reusable-block.mapper';
import { BlockTreeValidator } from '../validators/block-tree.validator';
import { BlockTreeSanitizer } from '../sanitization/block-tree-sanitizer.service';
import { ReusableBlockCycleValidator } from '../validators/reusable-block-cycle.validator';
import {
  ReusableBlockAlreadyDeletedException,
  ReusableBlockCircularReferenceException,
  ReusableBlockInUseException,
  ReusableBlockNameConflictException,
  ReusableBlockNotDeletedException,
  ReusableBlockNotFoundException,
} from '../exceptions/content-blocks.exceptions';
import { ReusableBlocksService } from './reusable-blocks.service';

function buildReusableBlock(overrides: Record<string, unknown> = {}) {
  return {
    id: 'block-1',
    siteId: 'site-1',
    name: 'Newsletter callout',
    blockType: 'callout',
    data: { text: 'Subscribe!' },
    children: null,
    description: null,
    category: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as never;
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    findByName: jest.fn().mockResolvedValue(null),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    findActivePageBodies: jest.fn().mockResolvedValue([]),
    findActiveArticleBodies: jest.fn().mockResolvedValue([]),
  } as unknown as ReusableBlockRepository;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;
  const cycleValidator = new ReusableBlockCycleValidator(repository);

  const service = new ReusableBlocksService(
    repository,
    new ReusableBlockMapper(),
    new BlockTreeValidator(),
    new BlockTreeSanitizer(),
    cycleValidator,
    auditLogger
  );

  return { service, repository };
}

const actor = { id: 'user-1' };

describe('ReusableBlocksService', () => {
  describe('createReusableBlock', () => {
    it('rejects a name that is already taken', async () => {
      const { service, repository } = buildService();
      (repository.findByName as jest.Mock).mockResolvedValue({ id: 'other' });
      await expect(
        service.createReusableBlock(
          { name: 'Newsletter callout', blockType: 'callout', data: { text: 'x' } },
          actor
        )
      ).rejects.toThrow(ReusableBlockNameConflictException);
    });

    it('rejects a block whose data does not match its blockType shape', async () => {
      const { service } = buildService();
      await expect(
        service.createReusableBlock({ name: 'Bad', blockType: 'callout', data: {} }, actor)
      ).rejects.toThrow();
    });

    it('rejects an unknown blockType', async () => {
      const { service } = buildService();
      await expect(
        service.createReusableBlock({ name: 'Bad type', blockType: 'not-a-type', data: {} }, actor)
      ).rejects.toThrow();
    });

    it('creates the block when name is available and data is valid', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildReusableBlock());
      const result = await service.createReusableBlock(
        { name: 'Newsletter callout', blockType: 'callout', data: { text: 'Subscribe!' } },
        actor
      );
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Newsletter callout', blockType: 'callout' })
      );
      expect(result.id).toBe('block-1');
    });
  });

  describe('getReusableBlock', () => {
    it('throws ReusableBlockNotFoundException when missing', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getReusableBlock('missing')).rejects.toThrow(
        ReusableBlockNotFoundException
      );
    });
  });

  describe('updateReusableBlock', () => {
    it('re-checks name uniqueness only when the name changes', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildReusableBlock());
      (repository.update as jest.Mock).mockResolvedValue(buildReusableBlock());
      await service.updateReusableBlock('block-1', { name: 'Newsletter callout' }, actor);
      expect(repository.findByName).not.toHaveBeenCalled();
    });

    it('validates new data against the existing blockType', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildReusableBlock());
      await expect(service.updateReusableBlock('block-1', { data: {} }, actor)).rejects.toThrow();
    });

    it('passes children through when updating a container block', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(
        buildReusableBlock({ blockType: 'columns', data: { columnCount: '2' } })
      );
      (repository.update as jest.Mock).mockResolvedValue(buildReusableBlock());
      const children = [{ id: 'c1', type: 'paragraph', data: { text: 'hi' } }];

      await service.updateReusableBlock('block-1', { children }, actor);

      expect(repository.update).toHaveBeenCalledWith(
        'block-1',
        expect.objectContaining({ children })
      );
    });

    it('rejects an update that would introduce a circular reference', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockImplementation((id: string) => {
        if (id === 'block-1') {
          return Promise.resolve(
            buildReusableBlock({
              id: 'block-1',
              blockType: 'reusable-block',
              data: { reusableBlockId: 'unrelated' },
            })
          );
        }
        if (id === 'block-2') {
          return Promise.resolve(
            buildReusableBlock({
              id: 'block-2',
              name: 'Block B',
              blockType: 'reusable-block',
              data: { reusableBlockId: 'block-1' },
            })
          );
        }
        return Promise.resolve(null);
      });

      await expect(
        service.updateReusableBlock('block-1', { data: { reusableBlockId: 'block-2' } }, actor)
      ).rejects.toThrow(ReusableBlockCircularReferenceException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('createReusableBlock', () => {
    it('passes children through on create for a container block', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockImplementation((data: Record<string, unknown>) =>
        Promise.resolve(buildReusableBlock(data))
      );
      const children = [{ id: 'c1', type: 'paragraph', data: { text: 'hi' } }];

      await service.createReusableBlock(
        { name: 'Two columns', blockType: 'columns', data: { columnCount: '2' }, children },
        actor
      );

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ children }));
    });

    it('does not false-positive on create: a brand-new block has no id yet, so nothing can already point to it', async () => {
      // A cycle can only be introduced by an UPDATE to a block other
      // blocks already reference — a freshly-created block has zero
      // incoming edges by construction, so create's cycle check must
      // never reject a normal (even self-referencing-looking, since the
      // *existing* block-2's own chain is irrelevant here) reference.
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(
        buildReusableBlock({
          id: 'block-2',
          name: 'Block B',
          blockType: 'callout',
          data: { text: 'hi' },
        })
      );
      (repository.create as jest.Mock).mockResolvedValue(buildReusableBlock());

      await expect(
        service.createReusableBlock(
          { name: 'New block', blockType: 'reusable-block', data: { reusableBlockId: 'block-2' } },
          actor
        )
      ).resolves.toBeDefined();
      expect(repository.create).toHaveBeenCalled();
    });
  });

  describe('deleteReusableBlock / restoreReusableBlock', () => {
    it('rejects deleting an already-deleted block', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(
        buildReusableBlock({ deletedAt: new Date() })
      );
      await expect(service.deleteReusableBlock('block-1', actor)).rejects.toThrow(
        ReusableBlockAlreadyDeletedException
      );
    });

    it('soft-deletes when not already deleted and there are no usages', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildReusableBlock());
      await service.deleteReusableBlock('block-1', actor);
      expect(repository.softDelete).toHaveBeenCalledWith('block-1', 'user-1');
    });

    it('rejects deleting a block that is still referenced by a page', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildReusableBlock());
      (repository.findActivePageBodies as jest.Mock).mockResolvedValue([
        {
          id: 'page-1',
          title: 'About',
          slug: 'about',
          body: {
            blocks: [{ id: 'n1', type: 'reusable-block', data: { reusableBlockId: 'block-1' } }],
          },
        },
      ]);

      await expect(service.deleteReusableBlock('block-1', actor)).rejects.toThrow(
        ReusableBlockInUseException
      );
      expect(repository.softDelete).not.toHaveBeenCalled();
    });

    it('rejects restoring a block that is not deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildReusableBlock());
      await expect(service.restoreReusableBlock('block-1', actor)).rejects.toThrow(
        ReusableBlockNotDeletedException
      );
    });
  });

  describe('getUsages', () => {
    it('returns every active page/article that references the block, ignoring ones that do not', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildReusableBlock());
      (repository.findActivePageBodies as jest.Mock).mockResolvedValue([
        {
          id: 'page-1',
          title: 'About',
          slug: 'about',
          body: {
            blocks: [{ id: 'n1', type: 'reusable-block', data: { reusableBlockId: 'block-1' } }],
          },
        },
        { id: 'page-2', title: 'Contact', slug: 'contact', body: { blocks: [] } },
      ]);
      (repository.findActiveArticleBodies as jest.Mock).mockResolvedValue([
        {
          id: 'article-1',
          title: 'News',
          slug: 'news',
          body: {
            blocks: [{ id: 'n2', type: 'reusable-block', data: { reusableBlockId: 'block-1' } }],
          },
        },
      ]);

      const usages = await service.getUsages('block-1');

      expect(usages).toEqual([
        { contentType: 'page', id: 'page-1', title: 'About', slug: 'about' },
        { contentType: 'article', id: 'article-1', title: 'News', slug: 'news' },
      ]);
    });

    it('returns an empty array when nothing references the block', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildReusableBlock());
      const usages = await service.getUsages('block-1');
      expect(usages).toEqual([]);
    });
  });
});
