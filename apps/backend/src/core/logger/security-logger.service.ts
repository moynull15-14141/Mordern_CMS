import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

export interface SecurityLogEntry {
  event: string;
  requestId?: string;
  correlationId?: string;
  path?: string;
  [key: string]: unknown;
}

/**
 * Dedicated channel for security-relevant signals (failed authentication,
 * forbidden access, rate-limit trips) so they can be filtered and alerted on
 * separately from routine error logs.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class SecurityLoggerService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('Security');
  }

  record(entry: SecurityLogEntry): void {
    this.logger.warn(entry, entry.event);
  }
}
