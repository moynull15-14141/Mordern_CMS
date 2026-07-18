import { MenuStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { MenuSortField } from '../constants/menu.constants';

export interface MenuQueryFilters {
  status?: MenuStatus;
  location?: string;
  search?: string;
}

export interface MenuQueryOptions {
  filters: MenuQueryFilters;
  sortBy: MenuSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
