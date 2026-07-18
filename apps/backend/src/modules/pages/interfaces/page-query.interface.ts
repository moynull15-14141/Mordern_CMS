import { ContentStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PageSortField } from '../constants/page.constants';

export interface PageQueryFilters {
  status?: ContentStatus;
  search?: string;
}

export interface PageQueryOptions {
  filters: PageQueryFilters;
  sortBy: PageSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
