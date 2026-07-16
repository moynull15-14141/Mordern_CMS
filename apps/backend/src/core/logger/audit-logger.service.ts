import { Injectable, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

export interface AuditLogEntry {
  actorId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'success' | 'failure';
  [key: string]: unknown;
}

/**
 * Structured trail of business-significant actions (who did what, to which
 * resource, with what result). Emits log lines only for now — persisting
 * these to an audit_logs table is the Audit business module, later in the
 * implementation order.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AuditLoggerService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('Audit');
  }

  record(entry: AuditLogEntry): void {
    this.logger.info(entry, `${entry.action} on ${entry.resource}`);
  }
}
