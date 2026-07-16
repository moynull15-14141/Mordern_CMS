import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

const SLOW_REQUEST_THRESHOLD_MS = 1000;

/**
 * Tracks request/operation durations and flags slow operations. Kept
 * separate from AppLoggerService so performance signals can be filtered,
 * sampled, or routed to a metrics sink independently of general app logs.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class PerformanceLoggerService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('Performance');
  }

  record(operation: string, durationMs: number, context: Record<string, unknown> = {}): void {
    const payload = { ...context, operation, durationMs };
    if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
      this.logger.warn(payload, `Slow operation: ${operation}`);
      return;
    }
    this.logger.debug(payload, `Operation timing: ${operation}`);
  }
}
