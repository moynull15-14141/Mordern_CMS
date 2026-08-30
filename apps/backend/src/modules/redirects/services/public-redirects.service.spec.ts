import { RedirectStatus } from '@prisma/client';
import { RedirectsRepository } from '../repositories/redirects.repository';
import { RedirectsMapper } from '../mappers/redirects.mapper';
import { PublicRedirectsService } from './public-redirects.service';

function buildRedirect() {
  return {
    id: 'redirect-1',
    siteId: 'site-1',
    sourcePath: '/old-about',
    destinationUrl: '/about',
    redirectType: 301,
    status: RedirectStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    createdBy: null,
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
  } as never;
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findActiveBySourcePath: jest.fn(),
  } as unknown as RedirectsRepository;
  const service = new PublicRedirectsService(repository, new RedirectsMapper());
  return { service, repository };
}

describe('PublicRedirectsService.lookup', () => {
  it('returns the public shape for an existing active redirect', async () => {
    const { service, repository } = buildService();
    (repository.findActiveBySourcePath as jest.Mock).mockResolvedValue(buildRedirect());

    const result = await service.lookup('/old-about');

    expect(repository.findActiveBySourcePath).toHaveBeenCalledWith('/old-about', 'site-1');
    expect(result).toEqual({ destinationUrl: '/about', redirectType: 301 });
  });

  it('normalizes the path before looking it up', async () => {
    const { service, repository } = buildService();
    (repository.findActiveBySourcePath as jest.Mock).mockResolvedValue(null);

    await service.lookup('old-about/');

    expect(repository.findActiveBySourcePath).toHaveBeenCalledWith('/old-about', 'site-1');
  });

  it('returns null (not a throw) when no redirect matches', async () => {
    const { service, repository } = buildService();
    (repository.findActiveBySourcePath as jest.Mock).mockResolvedValue(null);

    await expect(service.lookup('/nothing-here')).resolves.toBeNull();
  });

  it('returns null for an unparseable path rather than throwing', async () => {
    const { service } = buildService();
    await expect(service.lookup('javascript:alert(1)')).resolves.toBeNull();
  });
});
