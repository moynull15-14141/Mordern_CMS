import { CategoryStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { CategorySortField } from '../constants/category.constants';

export interface CategoryQueryFilters {
  status?: CategoryStatus;
  parentId?: string | null;
  search?: string;
}

export interface CategoryQueryOptions {
  filters: CategoryQueryFilters;
  sortBy: CategorySortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
