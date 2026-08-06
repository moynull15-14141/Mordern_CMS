import { ReusableBlock } from '@prisma/client';
import { ReusableBlockMapper } from './reusable-block.mapper';

function buildReusableBlock(overrides: Partial<ReusableBlock> = {}): ReusableBlock {
  return {
    id: 'block-1',
    siteId: 'site-1',
    name: 'Newsletter callout',
    blockType: 'callout',
    data: { text: 'Subscribe!' },
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
      blockType: 'callout',
      data: { text: 'Subscribe!' },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      deletedAt: null,
    });
  });

  it('maps deletedAt to an ISO string when set', () => {
    const mapper = new ReusableBlockMapper();
    const result = mapper.toResponseDto(buildReusableBlock({ deletedAt: new Date('2026-02-01') }));
    expect(result.deletedAt).toBe('2026-02-01T00:00:00.000Z');
  });
});
