import { ThemeStatus } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { ThemesRepository } from '../repositories/themes.repository';
import { ThemesValidator } from '../validators/themes.validator';
import { ThemesMapper } from '../mappers/themes.mapper';
import {
  NoActiveThemeException,
  ThemeAlreadyDeletedException,
  ThemeDeletedCannotActivateException,
  ThemeNotDeletedException,
  ThemeNotFoundException,
  ThemeSlugConflictException,
} from '../exceptions/theme.exceptions';
import { ThemesService } from './themes.service';
import type { Theme } from '@prisma/client';

function buildTheme(overrides: Partial<Theme> = {}): Theme {
  return {
    id: 'theme-1',
    siteId: 'site-1',
    name: 'Classic',
    slug: 'classic',
    version: null,
    author: null,
    description: null,
    thumbnail: null,
    status: ThemeStatus.DRAFT,
    isActive: false,
    settings: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Theme;
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    findBySlug: jest.fn().mockResolvedValue(null),
    findActive: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    activate: jest.fn(),
  } as unknown as ThemesRepository;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;
  const service = new ThemesService(
    repository,
    new ThemesValidator(),
    new ThemesMapper(),
    auditLogger
  );

  return { service, repository, auditLogger };
}

const actor = { id: 'user-1' };

describe('ThemesService', () => {
  describe('createTheme', () => {
    it('auto-generates and uniquifies a slug from the name when none is given', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock)
        .mockResolvedValueOnce({ id: 'other' })
        .mockResolvedValueOnce(null);
      (repository.create as jest.Mock).mockResolvedValue(buildTheme({ slug: 'classic-2' }));

      await service.createTheme({ name: 'Classic' } as never, actor);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'classic-2' })
      );
    });

    it('rejects a manually-provided slug that is already taken', async () => {
      const { service, repository } = buildService();
      (repository.findBySlug as jest.Mock).mockResolvedValue({ id: 'other' });

      await expect(
        service.createTheme({ name: 'Classic', slug: 'classic' } as never, actor)
      ).rejects.toThrow(ThemeSlugConflictException);
    });

    it('creates the theme inactive and DRAFT (no status/isActive in CreateThemeDto)', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildTheme());

      await service.createTheme({ name: 'Classic' } as never, actor);

      const callArg = (repository.create as jest.Mock).mock.calls[0][0];
      expect(callArg).not.toHaveProperty('status');
      expect(callArg).not.toHaveProperty('isActive');
    });

    it('passes settings through to the repository', async () => {
      const { service, repository } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildTheme());
      const settings = { primaryColor: '#112233' };

      await service.createTheme({ name: 'Classic', settings } as never, actor);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ settings }));
    });

    it('records a theme.create audit log entry', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildTheme());

      await service.createTheme({ name: 'Classic' } as never, actor);

      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: actor.id,
          action: 'theme.create',
          resourceId: 'theme-1',
        })
      );
    });
  });

  describe('getTheme', () => {
    it('throws ThemeNotFoundException when the theme does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getTheme('missing')).rejects.toThrow(ThemeNotFoundException);
    });

    it('returns the mapped theme when found', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme());
      const result = await service.getTheme('theme-1');
      expect(result.id).toBe('theme-1');
    });
  });

  describe('getActiveTheme', () => {
    it('throws NoActiveThemeException when no theme is active', async () => {
      const { service, repository } = buildService();
      (repository.findActive as jest.Mock).mockResolvedValue(null);
      await expect(service.getActiveTheme()).rejects.toThrow(NoActiveThemeException);
    });

    it('returns the mapped active theme', async () => {
      const { service, repository } = buildService();
      (repository.findActive as jest.Mock).mockResolvedValue(buildTheme({ isActive: true }));
      const result = await service.getActiveTheme();
      expect(result.isActive).toBe(true);
    });
  });

  describe('listThemes', () => {
    it('returns a paginated result built from the repository response', async () => {
      const { service, repository } = buildService();
      (repository.findMany as jest.Mock).mockResolvedValue({ items: [buildTheme()], total: 1 });

      const result = await service.listThemes({
        filters: {},
        sortBy: 'createdAt' as never,
        sortOrder: 'desc' as never,
        page: 1,
        limit: 20,
      });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('updateTheme', () => {
    it('throws ThemeNotFoundException when the theme does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.updateTheme('missing', {} as never, actor)).rejects.toThrow(
        ThemeNotFoundException
      );
    });

    it('leaves the slug untouched when the update does not change it', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme());
      (repository.update as jest.Mock).mockResolvedValue(buildTheme());

      await service.updateTheme('theme-1', { name: 'New Name' } as never, actor);

      expect(repository.findBySlug).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(
        'theme-1',
        expect.objectContaining({ slug: undefined })
      );
    });

    it('re-validates and re-uniquifies the slug when it changes', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme());
      (repository.findBySlug as jest.Mock).mockResolvedValue(null);
      (repository.update as jest.Mock).mockResolvedValue(buildTheme({ slug: 'new-slug' }));

      await service.updateTheme('theme-1', { slug: 'new-slug' } as never, actor);

      expect(repository.findBySlug).toHaveBeenCalledWith('new-slug', 'site-1', 'theme-1');
    });

    it('allows updating status via the generic update', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme());
      (repository.update as jest.Mock).mockResolvedValue(
        buildTheme({ status: ThemeStatus.PUBLISHED })
      );

      await service.updateTheme('theme-1', { status: 'PUBLISHED' } as never, actor);

      expect(repository.update).toHaveBeenCalledWith(
        'theme-1',
        expect.objectContaining({ status: 'PUBLISHED' })
      );
    });

    it('updates settings', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme());
      (repository.update as jest.Mock).mockResolvedValue(buildTheme());
      const settings = { primaryColor: '#000000' };

      await service.updateTheme('theme-1', { settings } as never, actor);

      expect(repository.update).toHaveBeenCalledWith(
        'theme-1',
        expect.objectContaining({ settings })
      );
    });
  });

  describe('deleteTheme / restoreTheme', () => {
    it('rejects deleting an already-deleted theme', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme({ deletedAt: new Date() }));
      await expect(service.deleteTheme('theme-1', actor)).rejects.toThrow(
        ThemeAlreadyDeletedException
      );
    });

    it('soft-deletes an active (non-deleted) theme', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildTheme())
        .mockResolvedValueOnce(buildTheme({ deletedAt: new Date() }));

      await service.deleteTheme('theme-1', actor);

      expect(repository.softDelete).toHaveBeenCalledWith('theme-1', actor.id);
    });

    it('rejects restoring a theme that is not deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme({ deletedAt: null }));
      await expect(service.restoreTheme('theme-1', actor)).rejects.toThrow(
        ThemeNotDeletedException
      );
    });

    it('restores a deleted theme', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildTheme({ deletedAt: new Date() }))
        .mockResolvedValueOnce(buildTheme({ deletedAt: null }));

      await service.restoreTheme('theme-1', actor);

      expect(repository.restore).toHaveBeenCalledWith('theme-1', actor.id);
    });
  });

  describe('activateTheme', () => {
    it('throws ThemeNotFoundException when the theme does not exist at all', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.activateTheme('missing', actor)).rejects.toThrow(ThemeNotFoundException);
    });

    it('rejects activating a soft-deleted theme', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme({ deletedAt: new Date() }));
      await expect(service.activateTheme('theme-1', actor)).rejects.toThrow(
        ThemeDeletedCannotActivateException
      );
    });

    it('looks up the theme with includeDeleted=true (to distinguish "deleted" from "never existed")', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme());
      (repository.activate as jest.Mock).mockResolvedValue(buildTheme({ isActive: true }));

      await service.activateTheme('theme-1', actor);

      expect(repository.findById).toHaveBeenCalledWith('theme-1', true);
    });

    it('activates a valid, non-deleted theme via the repository', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme());
      (repository.activate as jest.Mock).mockResolvedValue(buildTheme({ isActive: true }));

      const result = await service.activateTheme('theme-1', actor);

      expect(repository.activate).toHaveBeenCalledWith('theme-1', 'site-1', actor.id);
      expect(result.isActive).toBe(true);
    });

    it('records a theme.activate audit log entry', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildTheme());
      (repository.activate as jest.Mock).mockResolvedValue(buildTheme({ isActive: true }));

      await service.activateTheme('theme-1', actor);

      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: actor.id,
          action: 'theme.activate',
          resourceId: 'theme-1',
        })
      );
    });
  });
});
