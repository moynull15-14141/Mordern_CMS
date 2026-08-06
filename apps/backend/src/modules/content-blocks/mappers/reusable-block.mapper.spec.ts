import { ReusableBlock } from '@prisma/client';
import { ReusableBlockMapper } from './reusable-block.mapper';

function buildReusableBlock(overrides: Partial<ReusableBlock> = {}): ReusableBlock {
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
    updatedAt: new Date('2026-01-02'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as ReusableBlock;
}

describe('ReusableBlockMapper', () => {
  it('maps every field, ISO-stringifying dates', () => {
    const mapper = new ReusableBlockMapper();
    const result = mapper.toResponseDto(buildReusableBlock());

    expect(result).toEqual({
      id: 'block-1',
      name: 'Newsletter callout',
      description: null,
      category: null,
      blockType: 'callout',
      data: { text: 'Subscribe!' },
      children: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      deletedAt: null,
    });
  });

  it('maps description/category/children when present', () => {
    const mapper = new ReusableBlockMapper();
    const result = mapper.toResponseDto(
      buildReusableBlock({
        description: 'A reusable callout for the newsletter.',
        category: 'Marketing',
        children: [{ id: 'c1', type: 'paragraph', data: { text: 'nested' } }],
      })
    );
    expect(result.description).toBe('A reusable callout for the newsletter.');
    expect(result.category).toBe('Marketing');
    expect(result.children).toEqual([{ id: 'c1', type: 'paragraph', data: { text: 'nested' } }]);
  });

  it('maps deletedAt to an ISO string when set', () => {
    const mapper = new ReusableBlockMapper();
    const result = mapper.toResponseDto(buildReusableBlock({ deletedAt: new Date('2026-02-01') }));
    expect(result.deletedAt).toBe('2026-02-01T00:00:00.000Z');
  });
});
