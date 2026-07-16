import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { REQUEST_ID_HEADER } from '../../core/constants';

export interface RequestWithIds extends IncomingMessage {
  requestId?: string;
  correlationId?: string;
}

/**
 * Assigns a fresh identifier to every incoming request, regardless of
 * whether it belongs to a wider correlation chain. Used for per-hop tracing
 * in logs and echoed back via the x-request-id response header.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithIds, res: ServerResponse, next: () => void): void {
    const requestId = randomUUID();
    req.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}
