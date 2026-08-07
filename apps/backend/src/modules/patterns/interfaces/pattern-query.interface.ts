import { PatternStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PatternSortField } from '../constants/patterns.constants';

export interface PatternQueryFilters {
  search?: string;
  category?: string;
  tags?: string[];
  status?: PatternStatus;
}

export interface PatternQueryOptions {
  filters: PatternQueryFilters;
  sortBy: PatternSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
