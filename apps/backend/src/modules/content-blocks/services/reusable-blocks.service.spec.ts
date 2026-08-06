import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { ReusableBlockRepository } from '../repositories/reusable-block.repository';
import { ReusableBlockMapper } from '../mappers/reusable-block.mapper';
import { BlockTreeValidator } from '../validators/block-tree.validator';
import { BlockTreeSanitizer } from '../sanitization/block-tree-sanitizer.service';
import {
  ReusableBlockAlreadyDeletedException,
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
  } as unknown as ReusableBlockRepository;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new ReusableBlocksService(
    repository,
    new ReusableBlockMapper(),
    new BlockTreeValidator(),
    new BlockTreeSanitizer(),
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

    it('soft-deletes when not already deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildReusableBlock());
      await service.deleteReusableBlock('block-1', actor);
      expect(repository.softDelete).toHaveBeenCalledWith('block-1', 'user-1');
    });

    it('rejects restoring a block that is not deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildReusableBlock());
      await expect(service.restoreReusableBlock('block-1', actor)).rejects.toThrow(
        ReusableBlockNotDeletedException
      );
    });
  });
});
