import { CategoryStatus } from '@prisma/client';
import { CategoriesService } from './categories.service';
import { PublicCategoriesMapper } from '../mappers/public-categories.mapper';
import { PublicCategoriesService } from './public-categories.service';
import { CategoryNotFoundException } from '../exceptions/category.exceptions';
import { CategoryResponseDto } from '../dto/category-response.dto';
import { PublicCategoryQueryDto } from '../dto/public-category-query.dto';
import { CategorySortField } from '../constants/category.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';

function buildCategoryResponseDto(
  overrides: Partial<CategoryResponseDto> = {}
): CategoryResponseDto {
  return {
    id: 'cat-1',
    name: 'Football',
    slug: 'football',
    description: null,
    status: CategoryStatus.ACTIVE,
    parentId: null,
    sortOrder: 1,
    articleCount: 3,
    childrenCount: 0,
    seo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

function buildService() {
  const categoriesService = {
    listCategories: jest.fn(),
    getCategoryBySlug: jest.fn(),
  } as unknown as CategoriesService;
  const service = new PublicCategoriesService(categoriesService, new PublicCategoriesMapper());
  return { service, categoriesService };
}

describe('PublicCategoriesService', () => {
  describe('listCategories', () => {
    it('forces status=ACTIVE regardless of query input and passes pagination/sort through', async () => {
      const { service, categoriesService } = buildService();
      (categoriesService.listCategories as jest.Mock).mockResolvedValue({
        items: [buildCategoryResponseDto()],
        pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false },
      });

      const query: PublicCategoryQueryDto = {
        page: 2,
        limit: 10,
        search: 'foot',
        sortBy: CategorySortField.NAME,
        sortOrder: SortOrder.DESC,
      };
      const result = await service.listCategories(query);

      expect(categoriesService.listCategories).toHaveBeenCalledWith({
        filters: { status: CategoryStatus.ACTIVE, search: 'foot' },
        sortBy: CategorySortField.NAME,
        sortOrder: SortOrder.DESC,
        page: 2,
        limit: 10,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual({
        name: 'Football',
        slug: 'football',
        description: null,
        articleCount: 3,
        seo: null,
      });
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getCategoryBySlug', () => {
    it('returns the public shape for an ACTIVE category', async () => {
      const { service, categoriesService } = buildService();
      (categoriesService.getCategoryBySlug as jest.Mock).mockResolvedValue(
        buildCategoryResponseDto()
      );

      const result = await service.getCategoryBySlug('football');
      expect(result.slug).toBe('football');
    });

    it('throws CategoryNotFoundException for an INACTIVE category', async () => {
      const { service, categoriesService } = buildService();
      (categoriesService.getCategoryBySlug as jest.Mock).mockResolvedValue(
        buildCategoryResponseDto({ status: CategoryStatus.INACTIVE })
      );

      await expect(service.getCategoryBySlug('football')).rejects.toThrow(
        CategoryNotFoundException
      );
    });

    it('propagates CategoryNotFoundException when the underlying service throws', async () => {
      const { service, categoriesService } = buildService();
      (categoriesService.getCategoryBySlug as jest.Mock).mockRejectedValue(
        new CategoryNotFoundException('nope')
      );

      await expect(service.getCategoryBySlug('nope')).rejects.toThrow(CategoryNotFoundException);
    });
  });

  describe('resolvePublishedIdBySlug', () => {
    it('returns the id of an ACTIVE category (used by the SEO composition endpoint)', async () => {
      const { service, categoriesService } = buildService();
      (categoriesService.getCategoryBySlug as jest.Mock).mockResolvedValue(
        buildCategoryResponseDto({ id: 'cat-42' })
      );

      await expect(service.resolvePublishedIdBySlug('football')).resolves.toBe('cat-42');
    });

    it('applies the same ACTIVE-only gate as getCategoryBySlug', async () => {
      const { service, categoriesService } = buildService();
      (categoriesService.getCategoryBySlug as jest.Mock).mockResolvedValue(
        buildCategoryResponseDto({ status: CategoryStatus.INACTIVE })
      );

      await expect(service.resolvePublishedIdBySlug('football')).rejects.toThrow(
        CategoryNotFoundException
      );
    });
  });
});
