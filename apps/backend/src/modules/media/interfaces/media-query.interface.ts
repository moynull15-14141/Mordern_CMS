import { MediaStatus, MediaType } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { MediaSortField } from '../constants/media.constants';

export interface MediaQueryFilters {
  search?: string;
  filename?: string;
  mimeType?: string;
  extension?: string;
  folderId?: string | null;
  type?: MediaType;
  status?: MediaStatus;
  uploadedBy?: string;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface MediaQueryOptions {
  filters: MediaQueryFilters;
  sortBy: MediaSortField;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}
