import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

/**
 * Application-wide structured logger. Wraps nestjs-pino so every log line is
 * JSON with request correlation bindings, and implements Nest's LoggerService
 * so it can replace the default console logger via app.useLogger().
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  constructor(private readonly logger: PinoLogger) {}

  setContext(context: string): void {
    this.logger.setContext(context);
  }

  log(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context ?? {}, message);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context ?? {}, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context ?? {}, message);
  }

  error(message: string, trace?: string, context?: Record<string, unknown>): void {
    this.logger.error({ ...(context ?? {}), trace }, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context ?? {}, message);
  }

  verbose(message: string, context?: Record<string, unknown>): void {
    this.logger.trace(context ?? {}, message);
  }
}
