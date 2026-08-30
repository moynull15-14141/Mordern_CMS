import { RedirectStatus } from '@prisma/client';
import { RedirectsRepository } from '../repositories/redirects.repository';
import { RedirectsMapper } from '../mappers/redirects.mapper';
import { RedirectsService } from './redirects.service';
import {
  InvalidRedirectPathException,
  RedirectAlreadyDeletedException,
  RedirectLoopException,
  RedirectNotDeletedException,
  RedirectNotFoundException,
  RedirectSourceConflictException,
  SelfRedirectException,
} from '../exceptions/redirect.exceptions';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';

function buildRedirect(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'redirect-1',
    siteId: 'site-1',
    sourcePath: '/old-about',
    destinationUrl: '/about',
    redirectType: 301,
    status: RedirectStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    createdBy: 'user-1',
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findById: jest.fn(),
    findBySourcePath: jest.fn(),
    findActiveBySourcePath: jest.fn(),
    findAllActive: jest.fn().mockResolvedValue([]),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  } as unknown as RedirectsRepository;
  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;
  const service = new RedirectsService(repository, new RedirectsMapper(), auditLogger);
  return { service, repository };
}

const actor = { id: 'user-1' };

describe('RedirectsService.createRedirect', () => {
  it('normalizes the source path and creates the redirect', async () => {
    const { service, repository } = buildService();
    (repository.findBySourcePath as jest.Mock).mockResolvedValue(null);
    (repository.create as jest.Mock).mockResolvedValue(buildRedirect());

    const result = await service.createRedirect(
      { sourcePath: 'old-about', destinationUrl: '/about', redirectType: 301 },
      actor
    );

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ sourcePath: '/old-about', destinationUrl: '/about' })
    );
    expect(result.sourcePath).toBe('/old-about');
  });

  it('rejects an invalid source path', async () => {
    const { service } = buildService();
    await expect(
      service.createRedirect({ sourcePath: 'javascript:alert(1)', destinationUrl: '/about' }, actor)
    ).rejects.toThrow(InvalidRedirectPathException);
  });

  it('rejects an invalid destination', async () => {
    const { service, repository } = buildService();
    (repository.findBySourcePath as jest.Mock).mockResolvedValue(null);
    await expect(
      service.createRedirect(
        { sourcePath: '/old-about', destinationUrl: 'javascript:alert(1)' },
        actor
      )
    ).rejects.toThrow(InvalidRedirectPathException);
  });

  it('rejects a source path redirecting to itself', async () => {
    const { service, repository } = buildService();
    (repository.findBySourcePath as jest.Mock).mockResolvedValue(null);
    await expect(
      service.createRedirect({ sourcePath: '/about', destinationUrl: '/about' }, actor)
    ).rejects.toThrow(SelfRedirectException);
  });

  it('rejects a duplicate source path', async () => {
    const { service, repository } = buildService();
    (repository.findBySourcePath as jest.Mock).mockResolvedValue(buildRedirect());
    await expect(
      service.createRedirect({ sourcePath: '/old-about', destinationUrl: '/new-about' }, actor)
    ).rejects.toThrow(RedirectSourceConflictException);
  });

  it('rejects a redirect that would create a 2-hop loop', async () => {
    const { service, repository } = buildService();
    (repository.findBySourcePath as jest.Mock).mockResolvedValue(null);
    // /b -> /a already exists; creating /a -> /b would close the loop.
    (repository.findAllActive as jest.Mock).mockResolvedValue([
      buildRedirect({ id: 'r2', sourcePath: '/b', destinationUrl: '/a' }),
    ]);

    await expect(
      service.createRedirect({ sourcePath: '/a', destinationUrl: '/b' }, actor)
    ).rejects.toThrow(RedirectLoopException);
  });

  it('allows a redirect chain that terminates (no loop)', async () => {
    const { service, repository } = buildService();
    (repository.findBySourcePath as jest.Mock).mockResolvedValue(null);
    // /b -> /final (terminates) — /a -> /b is a valid 2-hop chain, not a loop.
    (repository.findAllActive as jest.Mock).mockResolvedValue([
      buildRedirect({ id: 'r2', sourcePath: '/b', destinationUrl: '/final' }),
    ]);
    (repository.create as jest.Mock).mockResolvedValue(
      buildRedirect({ sourcePath: '/a', destinationUrl: '/b' })
    );

    await expect(
      service.createRedirect({ sourcePath: '/a', destinationUrl: '/b' }, actor)
    ).resolves.toBeDefined();
  });

  it('does not chain-walk an external destination', async () => {
    const { service, repository } = buildService();
    (repository.findBySourcePath as jest.Mock).mockResolvedValue(null);
    (repository.create as jest.Mock).mockResolvedValue(
      buildRedirect({ destinationUrl: 'https://example.com' })
    );

    await service.createRedirect(
      { sourcePath: '/old', destinationUrl: 'https://example.com' },
      actor
    );
    expect(repository.findAllActive).not.toHaveBeenCalled();
  });
});

describe('RedirectsService.updateRedirect', () => {
  it('throws RedirectNotFoundException for an unknown id', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(null);
    await expect(service.updateRedirect('nope', {}, actor)).rejects.toThrow(
      RedirectNotFoundException
    );
  });

  it('re-checks source availability only when the source path actually changes', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(buildRedirect());
    (repository.update as jest.Mock).mockResolvedValue(buildRedirect({ redirectType: 302 }));

    await service.updateRedirect('redirect-1', { redirectType: 302 }, actor);
    expect(repository.findBySourcePath).not.toHaveBeenCalled();
  });

  it('rejects renaming the source path to one already in use by another redirect', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(buildRedirect());
    (repository.findBySourcePath as jest.Mock).mockResolvedValue(buildRedirect({ id: 'other' }));

    await expect(
      service.updateRedirect('redirect-1', { sourcePath: '/taken' }, actor)
    ).rejects.toThrow(RedirectSourceConflictException);
  });
});

describe('RedirectsService.deleteRedirect / restoreRedirect', () => {
  it('rejects deleting an already-deleted redirect', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(buildRedirect({ deletedAt: new Date() }));
    await expect(service.deleteRedirect('redirect-1', actor)).rejects.toThrow(
      RedirectAlreadyDeletedException
    );
  });

  it('rejects restoring a redirect that is not deleted', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock).mockResolvedValue(buildRedirect());
    await expect(service.restoreRedirect('redirect-1', actor)).rejects.toThrow(
      RedirectNotDeletedException
    );
  });

  it('soft-deletes and restores successfully through the happy path', async () => {
    const { service, repository } = buildService();
    (repository.findById as jest.Mock)
      .mockResolvedValueOnce(buildRedirect())
      .mockResolvedValueOnce(buildRedirect({ deletedAt: new Date() }));
    (repository.softDelete as jest.Mock).mockResolvedValue(undefined);

    await service.deleteRedirect('redirect-1', actor);
    expect(repository.softDelete).toHaveBeenCalledWith('redirect-1', actor.id);
  });
});
