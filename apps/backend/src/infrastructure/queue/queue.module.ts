import { Global, Module } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { ConfigModule } from '../../config/config.module';
import { ErrorLoggerService } from '../../core/logger/error-logger.service';
import { BullMqJobQueueProvider } from './bullmq-job-queue.provider';
import { InProcessJobQueueProvider } from './in-process-job-queue.provider';
import { JOB_QUEUE } from './queue.constants';

/**
 * Global — every module that enqueues or handles a background job
 * (currently only `MediaModule`'s `process-media-asset` job) injects
 * `JOB_QUEUE` directly, the same way `DatabaseModule`/`LoggerModule` are
 * global. `QUEUE_DRIVER=in-process` (default) selects
 * `InProcessJobQueueProvider`; `QUEUE_DRIVER=bullmq` selects
 * `BullMqJobQueueProvider` — a config swap, not a rewrite of any consumer.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: JOB_QUEUE,
      useFactory: (config: AppConfigService, errorLogger: ErrorLoggerService) => {
        if (config.queue.driver === 'bullmq') {
          return new BullMqJobQueueProvider(config, errorLogger);
        }
        return new InProcessJobQueueProvider(errorLogger);
      },
      inject: [AppConfigService, ErrorLoggerService],
    },
  ],
  exports: [JOB_QUEUE],
})
export class QueueModule {}
