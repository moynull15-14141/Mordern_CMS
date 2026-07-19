import { LayoutStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { LayoutSortField } from '../constants/layout.constants';

export interface LayoutQueryFilters {
  status?: LayoutStatus;
  themeId?: string;
  search?: string;
}

export interface LayoutQueryOptions {
  filters: LayoutQueryFilters;
  sortBy: LayoutSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
