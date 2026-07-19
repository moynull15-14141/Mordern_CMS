import { Layout } from '@prisma/client';
import { LayoutsMapper } from './layouts.mapper';

function buildLayout(overrides: Partial<Layout> = {}): Layout {
  return {
    id: 'layout-1',
    siteId: 'site-1',
    themeId: null,
    name: 'Default',
    slug: 'default',
    status: 'DRAFT',
    layoutPreset: 'default',
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-02'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Layout;
}

describe('LayoutsMapper', () => {
  it('maps every field, ISO-stringifying dates', () => {
    const mapper = new LayoutsMapper();
    const result = mapper.toResponseDto(buildLayout({ themeId: 'theme-1' }));

    expect(result).toEqual({
      id: 'layout-1',
      name: 'Default',
      slug: 'default',
      status: 'DRAFT',
      layoutPreset: 'default',
      themeId: 'theme-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      deletedAt: null,
    });
  });

  it('maps deletedAt to an ISO string when set', () => {
    const mapper = new LayoutsMapper();
    const result = mapper.toResponseDto(buildLayout({ deletedAt: new Date('2026-02-01') }));
    expect(result.deletedAt).toBe('2026-02-01T00:00:00.000Z');
  });
});
