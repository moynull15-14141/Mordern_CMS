import { Pattern, PatternStatus } from '@prisma/client';
import { PatternMapper } from './pattern.mapper';

function buildPattern(overrides: Partial<Pattern> = {}): Pattern {
  return {
    id: 'pattern-1',
    siteId: 'site-1',
    name: 'Hero Banner',
    slug: 'hero-banner',
    description: null,
    category: 'Hero',
    tags: ['landing'],
    status: PatternStatus.ACTIVE,
    thumbnailMediaId: null,
    body: { blocks: [{ id: 'b1', type: 'heading', data: { text: 'Hi' } }] },
    version: 1,
    createdAt: new Date('2026-01-01'),
    createdBy: 'user-1',
    updatedAt: new Date('2026-01-02'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Pattern;
}

describe('PatternMapper', () => {
  const mapper = new PatternMapper();

  it('maps every field to the full response DTO', () => {
    const result = mapper.toResponseDto(buildPattern());
    expect(result).toMatchObject({
      id: 'pattern-1',
      name: 'Hero Banner',
      slug: 'hero-banner',
      category: 'Hero',
      tags: ['landing'],
      status: PatternStatus.ACTIVE,
      version: 1,
      createdBy: 'user-1',
    });
    expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('maps a deleted pattern with a deletedAt timestamp', () => {
    const result = mapper.toResponseDto(buildPattern({ deletedAt: new Date('2026-03-01') }));
    expect(result.deletedAt).toBe('2026-03-01T00:00:00.000Z');
  });

  it('summary DTO derives blockCount from body.blocks and omits body', () => {
    const result = mapper.toSummaryDto(
      buildPattern({
        body: {
          blocks: [
            { id: 'b1', type: 'heading' },
            { id: 'b2', type: 'paragraph' },
          ],
        },
      })
    );
    expect(result.blockCount).toBe(2);
    expect(result).not.toHaveProperty('body');
  });

  it('summary DTO reports blockCount 0 for a malformed/empty body', () => {
    const result = mapper.toSummaryDto(buildPattern({ body: {} }));
    expect(result.blockCount).toBe(0);
  });

  it('public DTO exposes only id/name/body', () => {
    const result = mapper.toPublicResponseDto(buildPattern());
    expect(Object.keys(result).sort()).toEqual(['body', 'id', 'name']);
  });
});
