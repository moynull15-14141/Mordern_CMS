import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { TagsRepository } from '../repositories/tags.repository';
import { SlugShapeValidator } from '../validators/slug-shape.validator';
import { TagsMapper } from '../mappers/tags.mapper';
import {
  TagAlreadyDeletedException,
  TagInUseException,
  TagNameConflictException,
  TagNotDeletedException,
  TagNotFoundException,
  TagSlugConflictException,
} from '../exceptions/category.exceptions';
import { TagsService } from './tags.service';

function buildTag(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tag-1',
    siteId: 'site-1',
    name: 'Sports',
    slug: 'sports',
    description: null,
    synonyms: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    findBySlug: jest.fn().mockResolvedValue(null),
    findByName: jest.fn().mockResolvedValue(null),
    findMany: jest.fn(),
    countArticlesUsingTag: jest.fn().mockResolvedValue(0),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  } as unknown as TagsRepository;

  const authorizationService = {
    resolveEffectiveRoles: jest.fn().mockResolvedValue([SystemRole.SUPER_ADMIN]),
  } as unknown as AuthorizationService;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new TagsService(
    repository,
    new SlugShapeValidator(),
    new TagsMapper(),
    authorizationService,
    auditLogger
  );

  return { service, repository, authorizationService };
}

const actor = { id: 'user-1' };

describe('TagsService', () => {
  describe('createTag', () => {
    it('rejects a duplicate name', async () => {
      const { service, repository } = buildService();
      (repository.findByName as jest.Mock).mockResolvedValue(buildTag());
      await expect(service.createTag({ name: 'Sports' } as never, actor)).rejects.toThrow(
        TagNameConflictException
      );
    });

    it('auto-generates and uniquifies a slug from the name', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock)
        .mockResolvedValueOnce({ id: 'other' })
        .mockResolvedValueOnce(null);
      (repository.create as jest.Mock).mockResolvedValue(buildTag());
      await service.createTag({ name: 'Sports' } as never, actor);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'sports-2' }));
    });

    it('rejects an explicit slug that is already taken', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock).mockResolvedValue({ id: 'other' });
      await expect(
        service.createTag({ name: 'Sports', slug: 'taken' } as never, actor)
      ).rejects.toThrow(TagSlugConflictException);
    });

    it('creates the tag and audits the action', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildTag());
      const result = await service.createTag({ name: 'Sports' } as never, actor);
      expect(result.id).toBe('tag-1');
    });
  });

  describe('getTag', () => {
    it('throws TagNotFoundException when missing', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getTag('missing')).rejects.toThrow(TagNotFoundException);
    });

    it('maps a found tag with a computed usage count', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTag());
      (repository.countArticlesUsingTag as jest.Mock).mockResolvedValue(5);
      const result = await service.getTag('tag-1');
      expect(result.usageCount).toBe(5);
    });
  });

  describe('updateTag', () => {
    it('denies update when the actor lacks a taxonomy-managing role', async () => {
      const { service, repository, authorizationService } = buildService();
      (authorizationService.resolveEffectiveRoles as jest.Mock).mockResolvedValue([
        SystemRole.SUBSCRIBER,
      ]);
      (repository.findById as jest.Mock).mockResolvedValue(buildTag());
      await expect(
        service.updateTag('tag-1', { name: 'Updated' } as never, actor)
      ).rejects.toThrow();
    });

    it('updates when allowed', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTag());
      (repository.update as jest.Mock).mockResolvedValue(buildTag({ description: 'Updated' }));
      await service.updateTag('tag-1', { description: 'Updated' } as never, actor);
      expect(repository.update).toHaveBeenCalledWith(
        'tag-1',
        expect.objectContaining({ description: 'Updated' })
      );
    });
  });

  describe('deleteTag', () => {
    it('rejects deleting an already-deleted tag', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTag({ deletedAt: new Date() }));
      await expect(service.deleteTag('tag-1', actor)).rejects.toThrow(TagAlreadyDeletedException);
    });

    it('rejects deleting a tag still used by articles', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTag());
      (repository.countArticlesUsingTag as jest.Mock).mockResolvedValue(2);
      await expect(service.deleteTag('tag-1', actor)).rejects.toThrow(TagInUseException);
    });

    it('soft-deletes when unused', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTag());
      await service.deleteTag('tag-1', actor);
      expect(repository.softDelete).toHaveBeenCalledWith('tag-1', 'user-1');
    });
  });

  describe('restoreTag', () => {
    it('rejects restoring a non-deleted tag', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTag());
      await expect(service.restoreTag('tag-1', actor)).rejects.toThrow(TagNotDeletedException);
    });

    it('restores a deleted tag', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTag({ deletedAt: new Date() }));
      await service.restoreTag('tag-1', actor);
      expect(repository.restore).toHaveBeenCalledWith('tag-1', 'user-1');
    });
  });
});
