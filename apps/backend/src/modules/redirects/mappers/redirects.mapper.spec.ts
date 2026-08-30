import { RedirectStatus } from '@prisma/client';
import { RedirectsMapper } from './redirects.mapper';

function buildRedirect() {
  return {
    id: 'redirect-1',
    siteId: 'site-1',
    sourcePath: '/old-about',
    destinationUrl: '/about',
    redirectType: 301,
    status: RedirectStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    createdBy: 'user-1',
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
  } as never;
}

describe('RedirectsMapper', () => {
  const mapper = new RedirectsMapper();

  it('toResponseDto maps every field, serializing dates to ISO strings', () => {
    const result = mapper.toResponseDto(buildRedirect());
    expect(result).toEqual({
      id: 'redirect-1',
      sourcePath: '/old-about',
      destinationUrl: '/about',
      redirectType: 301,
      status: RedirectStatus.ACTIVE,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      deletedAt: null,
    });
  });

  it('toPublicResponseDto exposes only destinationUrl and redirectType', () => {
    const result = mapper.toPublicResponseDto(buildRedirect());
    expect(result).toEqual({ destinationUrl: '/about', redirectType: 301 });
  });
});
