import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { AppConfigService } from '../../config/config.service';
import { ErrorLoggerService } from '../../core/logger/error-logger.service';
import type {
  EnqueueOptions,
  JobHandler,
  JobQueue,
} from '../../core/interfaces/job-queue.interface';

const QUEUE_NAME = 'modern-cms';
const DEFAULT_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 500;

/**
 * Real BullMQ+Redis `JobQueue` implementation — written and ready, but
 * inactive by default (`QUEUE_DRIVER` defaults to `in-process`; no Redis is
 * reachable in this dev environment, confirmed via a direct TCP check on
 * localhost:6379). Activate with `QUEUE_DRIVER=bullmq` once a real Redis
 * exists — see `queue.module.ts`'s factory for the selection logic.
 */
@Injectable()
export class BullMqJobQueueProvider implements JobQueue, OnModuleDestroy {
  readonly name = 'bullmq';

  private readonly connection: IORedis;
  private readonly queue: Queue;
  private readonly handlers = new Map<string, JobHandler>();
  private worker: Worker | null = null;

  constructor(
    config: AppConfigService,
    private readonly errorLogger: ErrorLoggerService
  ) {
    this.connection = new IORedis(config.cache.redisUrl, { maxRetriesPerRequest: null });
    this.queue = new Queue(QUEUE_NAME, { connection: this.connection });
  }

  register<TPayload = unknown>(jobType: string, handler: JobHandler<TPayload>): void {
    this.handlers.set(jobType, handler as JobHandler);
    this.ensureWorker();
  }

  async enqueue<TPayload = unknown>(
    jobType: string,
    payload: TPayload,
    options?: EnqueueOptions
  ): Promise<void> {
    await this.queue.add(jobType, payload, {
      attempts: options?.attempts ?? DEFAULT_ATTEMPTS,
      delay: options?.delayMs,
      backoff: { type: 'exponential', delay: RETRY_BACKOFF_MS },
    });
  }

  private ensureWorker(): void {
    if (this.worker) return;
    this.worker = new Worker(
      QUEUE_NAME,
      async (job: Job) => {
        const handler = this.handlers.get(job.name);
        if (!handler) {
          throw new Error(`No JobQueue handler registered for job type "${job.name}".`);
        }
        await handler(job.data);
      },
      { connection: this.connection }
    );
    this.worker.on('failed', (job, error) => {
      this.errorLogger.logError(error, { code: 'job_queue.bullmq_failed', jobType: job?.name });
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue.close();
    this.connection.disconnect();
  }
}
