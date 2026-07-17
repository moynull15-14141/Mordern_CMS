import { ContentStatus, ArticleVisibility } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { ArticleSortField } from '../constants/article.constants';

export interface ArticleQueryFilters {
  status?: ContentStatus;
  visibility?: ArticleVisibility;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  search?: string;
  publishedFrom?: Date;
  publishedTo?: Date;
}

export interface ArticleQueryOptions {
  filters: ArticleQueryFilters;
  sortBy: ArticleSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
