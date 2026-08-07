import { Provider } from './provider.interface';

export type JobHandler<TPayload = unknown> = (payload: TPayload) => Promise<void>;

export interface EnqueueOptions {
  /** Number of retry attempts on failure (default left to the driver). */
  attempts?: number;
  /** Delay before the job first runs, in milliseconds. */
  delayMs?: number;
}

/**
 * Swappable background-job contract (Milestone 5), mirroring the existing
 * `StorageProvider`/`CacheProvider` "real interface, deferred-until-infra-
 * exists implementation" pattern. `InProcessJobQueueProvider`
 * (`infrastructure/queue/in-process-job-queue.provider.ts`) is the default —
 * no Redis is reachable in this dev environment (confirmed via a direct TCP
 * check on localhost:6379). `BullMqJobQueueProvider`
 * (`infrastructure/queue/bullmq-job-queue.provider.ts`) is a real
 * implementation behind the same interface, selected via
 * `QUEUE_DRIVER=bullmq` once a real Redis exists — a config swap, not a
 * rewrite of any call site.
 */
export interface JobQueue extends Provider {
  /** Registers the handler for a job type. Call once per job type at module init. */
  register<TPayload = unknown>(jobType: string, handler: JobHandler<TPayload>): void;
  /** Schedules a job for (eventual) execution. Never runs the handler synchronously/inline. */
  enqueue<TPayload = unknown>(
    jobType: string,
    payload: TPayload,
    options?: EnqueueOptions
  ): Promise<void>;
}
