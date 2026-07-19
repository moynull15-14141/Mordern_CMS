import { CategoryStatus } from '@prisma/client';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { PublicCategoriesMapper } from './public-categories.mapper';

function buildCategoryResponseDto(
  overrides: Partial<CategoryResponseDto> = {}
): CategoryResponseDto {
  return {
    id: 'cat-1',
    name: 'Football',
    slug: 'football',
    description: 'All things football',
    status: CategoryStatus.ACTIVE,
    parentId: null,
    sortOrder: 1,
    articleCount: 5,
    childrenCount: 2,
    seo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

describe('PublicCategoriesMapper', () => {
  const mapper = new PublicCategoriesMapper();

  it('maps name/slug/description/articleCount through unchanged', () => {
    const result = mapper.toPublicResponseDto(buildCategoryResponseDto());
    expect(result).toEqual({
      name: 'Football',
      slug: 'football',
      description: 'All things football',
      articleCount: 5,
      seo: null,
    });
  });

  it('never exposes id, parentId, sortOrder, childrenCount, status, or audit fields', () => {
    const result = mapper.toPublicResponseDto(buildCategoryResponseDto()) as unknown as Record<
      string,
      unknown
    >;

    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('parentId');
    expect(result).not.toHaveProperty('sortOrder');
    expect(result).not.toHaveProperty('childrenCount');
    expect(result).not.toHaveProperty('status');
    expect(result).not.toHaveProperty('createdAt');
    expect(result).not.toHaveProperty('updatedAt');
    expect(result).not.toHaveProperty('deletedAt');
  });

  it('maps seo fields but omits extraMeta', () => {
    const result = mapper.toPublicResponseDto(
      buildCategoryResponseDto({
        seo: {
          title: 'Football News',
          keywords: [],
          extraMeta: { secret: true },
        },
      })
    );

    expect(result.seo).not.toHaveProperty('extraMeta');
    expect(result.seo?.title).toBe('Football News');
  });
});
