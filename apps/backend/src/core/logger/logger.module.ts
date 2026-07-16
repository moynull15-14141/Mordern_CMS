import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { REQUEST_ID_HEADER } from '../constants';
import { AppLoggerService } from './app-logger.service';
import { AuditLoggerService } from './audit-logger.service';
import { ErrorLoggerService } from './error-logger.service';
import { PerformanceLoggerService } from './performance-logger.service';
import { SecurityLoggerService } from './security-logger.service';

/**
 * Global logging module. Configures nestjs-pino (structured JSON logs, one
 * line per HTTP request) and exposes the enterprise logger abstractions
 * (Application / Error / Performance / Audit / Security) that the rest of
 * the backend depends on instead of console.log.
 */
@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('app.env');
        const isProduction = nodeEnv === 'production';
        return {
          pinoHttp: {
            genReqId: (req: { headers: Record<string, string | string[] | undefined> }) =>
              (req.headers[REQUEST_ID_HEADER] as string) || randomUUID(),
            autoLogging: true,
            transport: isProduction
              ? undefined
              : { target: 'pino-pretty', options: { singleLine: true } },
            redact: ['req.headers.authorization', 'req.headers.cookie'],
          },
        };
      },
    }),
  ],
  providers: [
    AppLoggerService,
    ErrorLoggerService,
    PerformanceLoggerService,
    AuditLoggerService,
    SecurityLoggerService,
  ],
  exports: [
    AppLoggerService,
    ErrorLoggerService,
    PerformanceLoggerService,
    AuditLoggerService,
    SecurityLoggerService,
    PinoLoggerModule,
  ],
})
export class LoggerModule {}
