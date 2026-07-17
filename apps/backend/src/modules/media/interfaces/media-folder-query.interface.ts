import { SortOrder } from '../../../common/dto/pagination.dto';
import { MediaFolderSortField } from '../constants/media.constants';

export interface MediaFolderQueryFilters {
  parentId?: string | null;
  search?: string;
}

export interface MediaFolderQueryOptions {
  filters: MediaFolderQueryFilters;
  sortBy: MediaFolderSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
