import { Injectable } from '@nestjs/common';
import { ErrorLoggerService } from '../../core/logger/error-logger.service';
import type {
  EnqueueOptions,
  JobHandler,
  JobQueue,
} from '../../core/interfaces/job-queue.interface';

const DEFAULT_ATTEMPTS = 3;
const RETRY_BACKOFF_MS = 500;

/**
 * Default `JobQueue` driver — no Redis reachable in this dev environment
 * (confirmed via a direct TCP check on localhost:6379), so jobs run
 * in-process via `setImmediate` with a small retry loop, entirely in
 * memory. Jobs do not survive a process restart — acceptable for this
 * milestone's one job type (`process-media-asset`), which is idempotent
 * (re-running it on the same `mediaAssetId` just re-derives variants).
 * Swap to `BullMqJobQueueProvider` via `QUEUE_DRIVER=bullmq` once a real
 * Redis exists, with zero call-site changes.
 */
@Injectable()
export class InProcessJobQueueProvider implements JobQueue {
  readonly name = 'in-process';

  private readonly handlers = new Map<string, JobHandler>();

  constructor(private readonly errorLogger: ErrorLoggerService) {}

  register<TPayload = unknown>(jobType: string, handler: JobHandler<TPayload>): void {
    this.handlers.set(jobType, handler as JobHandler);
  }

  async enqueue<TPayload = unknown>(
    jobType: string,
    payload: TPayload,
    options?: EnqueueOptions
  ): Promise<void> {
    const handler = this.handlers.get(jobType);
    if (!handler) {
      throw new Error(`No JobQueue handler registered for job type "${jobType}".`);
    }
    const attempts = options?.attempts ?? DEFAULT_ATTEMPTS;
    const delayMs = options?.delayMs ?? 0;

    const run = () => {
      void this.runWithRetries(jobType, handler, payload, attempts);
    };

    if (delayMs > 0) {
      setTimeout(run, delayMs);
    } else {
      setImmediate(run);
    }
  }

  private async runWithRetries(
    jobType: string,
    handler: JobHandler,
    payload: unknown,
    attempts: number
  ): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        await handler(payload);
        return;
      } catch (error) {
        lastError = error;
        this.errorLogger.logError(error, {
          code: 'job_queue.attempt_failed',
          jobType,
          attempt,
          attempts,
        });
        if (attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_BACKOFF_MS * attempt));
        }
      }
    }
    this.errorLogger.logError(lastError, { code: 'job_queue.exhausted', jobType, attempts });
  }
}
