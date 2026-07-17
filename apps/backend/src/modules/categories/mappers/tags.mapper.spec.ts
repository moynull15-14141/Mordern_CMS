import { Tag } from '@prisma/client';
import { TagsMapper } from './tags.mapper';

function buildTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: 'tag-1',
    siteId: 'site-1',
    name: 'Sports',
    slug: 'sports',
    description: null,
    synonyms: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-02'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Tag;
}

describe('TagsMapper', () => {
  const mapper = new TagsMapper();

  it('maps a tag with usage count', () => {
    const result = mapper.toResponseDto(buildTag(), 7);
    expect(result.id).toBe('tag-1');
    expect(result.usageCount).toBe(7);
  });

  it('maps synonyms when present', () => {
    const result = mapper.toResponseDto(buildTag({ synonyms: ['athletics', 'sport'] }), 0);
    expect(result.synonyms).toEqual(['athletics', 'sport']);
  });

  it('maps null synonyms as null', () => {
    const result = mapper.toResponseDto(buildTag(), 0);
    expect(result.synonyms).toBeNull();
  });

  it('maps a deleted tag', () => {
    const result = mapper.toResponseDto(buildTag({ deletedAt: new Date('2026-03-01') }), 0);
    expect(result.deletedAt).toBe('2026-03-01T00:00:00.000Z');
  });
});
