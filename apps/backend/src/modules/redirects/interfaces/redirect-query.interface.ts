import { RedirectStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { RedirectSortField } from '../constants/redirect.constants';

export interface RedirectQueryFilters {
  status?: RedirectStatus;
  search?: string;
}

export interface RedirectQueryOptions {
  filters: RedirectQueryFilters;
  sortBy: RedirectSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
