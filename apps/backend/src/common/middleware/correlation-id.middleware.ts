import { Injectable, NestMiddleware } from '@nestjs/common';
import type { ServerResponse } from 'node:http';
import { CORRELATION_ID_HEADER } from '../../core/constants';
import { RequestWithIds } from './request-id.middleware';

/**
 * Propagates a correlation id across service hops: reuses an inbound
 * x-correlation-id header when present (client/upstream-service supplied),
 * otherwise falls back to this request's own id. Must run after
 * RequestIdMiddleware so req.requestId is already set.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: RequestWithIds, res: ServerResponse, next: () => void): void {
    const incoming = req.headers[CORRELATION_ID_HEADER];
    const correlationId = (Array.isArray(incoming) ? incoming[0] : incoming) || req.requestId;
    req.correlationId = correlationId;
    if (correlationId) {
      res.setHeader(CORRELATION_ID_HEADER, correlationId);
    }
    next();
  }
}
