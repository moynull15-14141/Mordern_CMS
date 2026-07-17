import { CommentStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { CommentSortField } from '../constants/comment.constants';

export interface CommentQueryFilters {
  articleId?: string;
  userId?: string;
  parentId?: string | null;
  status?: CommentStatus;
  search?: string;
}

export interface CommentQueryOptions {
  filters: CommentQueryFilters;
  sortBy: CommentSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
