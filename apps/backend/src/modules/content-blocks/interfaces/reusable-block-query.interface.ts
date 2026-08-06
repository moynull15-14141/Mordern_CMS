import { SortOrder } from '../../../common/dto/pagination.dto';
import { ReusableBlockSortField } from '../constants/reusable-block.constants';

export interface ReusableBlockQueryFilters {
  blockType?: string;
  search?: string;
}

export interface ReusableBlockQueryOptions {
  filters: ReusableBlockQueryFilters;
  sortBy: ReusableBlockSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
