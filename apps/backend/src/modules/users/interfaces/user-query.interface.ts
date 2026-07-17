import { UserStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { UserSortField } from '../constants/user.constants';

export interface UserQueryFilters {
  email?: string;
  username?: string;
  displayName?: string;
  role?: string;
  status?: UserStatus;
  createdFrom?: Date;
  createdTo?: Date;
  updatedFrom?: Date;
  updatedTo?: Date;
  search?: string;
}

export interface UserQueryOptions {
  filters: UserQueryFilters;
  sortBy: UserSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
