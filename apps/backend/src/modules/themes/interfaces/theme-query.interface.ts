import { ThemeStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { ThemeSortField } from '../constants/theme.constants';

export interface ThemeQueryFilters {
  status?: ThemeStatus;
  isActive?: boolean;
  search?: string;
}

export interface ThemeQueryOptions {
  filters: ThemeQueryFilters;
  sortBy: ThemeSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
