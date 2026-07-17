import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/** Generic sort direction — shared across any future list endpoint, not
 * Users-specific. */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export interface PaginationResultMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Recognized by `ResponseInterceptor` (common/interceptors/response.interceptor.ts)
 * — a controller returning this shape gets `items` unwrapped into the frozen
 * envelope's `data` and `pagination` copied into `meta.pagination`, instead
 * of the whole object being placed under `data` verbatim.
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationResultMeta;
}

export function buildPaginatedResult<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResult<T> {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    },
  };
}

export function isPaginatedResult(value: unknown): value is PaginatedResult<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as PaginatedResult<unknown>).items) &&
    typeof (value as PaginatedResult<unknown>).pagination === 'object'
  );
}
