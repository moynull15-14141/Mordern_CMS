export type RedirectStatus = 'ACTIVE' | 'INACTIVE';
export type RedirectSortField = 'sourcePath' | 'createdAt' | 'updatedAt';

export interface Redirect {
  id: string;
  sourcePath: string;
  destinationUrl: string;
  redirectType: number;
  status: RedirectStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RedirectFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: RedirectStatus;
  sortBy?: RedirectSortField;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateRedirectInput {
  sourcePath: string;
  destinationUrl: string;
  redirectType?: number;
}

export interface UpdateRedirectInput {
  sourcePath?: string;
  destinationUrl?: string;
  redirectType?: number;
  status?: RedirectStatus;
}
