import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { buildSuccessResponse } from '../../core/responses/api-response';
import { isPaginatedResult } from '../dto/pagination.dto';
import { RequestWithIds } from '../middleware/request-id.middleware';

/**
 * Wraps every successful controller response in the frozen
 * { success: true, message, data, meta, errors: [] } envelope defined by the
 * API contract strategy in 20_BACKEND_ARCHITECTURE.md §13.
 *
 * A controller returning a `PaginatedResult<T>` (Milestone 7 — Users list
 * endpoint is the first caller) is special-cased: `items` becomes `data` and
 * `pagination` is copied into `meta.pagination`, so callers get the frozen
 * envelope's existing `PaginationMeta` shape instead of a raw object under
 * `data`. Every other return shape is wrapped exactly as before.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest & RequestWithIds>();

    return next.handle().pipe(
      map((data) => {
        if (isPaginatedResult(data)) {
          return buildSuccessResponse(data.items, {
            meta: { requestId: request.requestId, pagination: data.pagination },
          });
        }
        return buildSuccessResponse(data, { meta: { requestId: request.requestId } });
      })
    );
  }
}
