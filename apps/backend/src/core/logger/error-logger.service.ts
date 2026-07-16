import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

export interface ErrorLogContext {
  requestId?: string;
  correlationId?: string;
  path?: string;
  code?: string;
  [key: string]: unknown;
}

/**
 * Dedicated sink for exception logging so the global exception filter has a
 * single, consistent place to record failures with stack traces and request
 * correlation, separate from routine application/request logs.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class ErrorLoggerService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('ErrorLogger');
  }

  logError(error: unknown, context: ErrorLogContext = {}): void {
    const stack = error instanceof Error ? error.stack : undefined;
    const message = error instanceof Error ? error.message : 'Unknown error';
    this.logger.error({ ...context, stack }, message);
  }
}
