import { SortOrder } from '../../../common/dto/pagination.dto';
import { TagSortField } from '../constants/category.constants';

export interface TagQueryFilters {
  search?: string;
}

export interface TagQueryOptions {
  filters: TagQueryFilters;
  sortBy: TagSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
