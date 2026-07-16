export interface DomainEvent<TPayload = unknown> {
  name: string;
  occurredAt: Date;
  payload: TPayload;
}

export interface ApplicationEvent<TPayload = unknown> {
  name: string;
  triggeredAt: Date;
  payload: TPayload;
}

export interface WorkerEvent<TPayload = unknown> {
  name: string;
  queuedAt: Date;
  payload: TPayload;
}

/**
 * Narrower than EventBus (publish-only, no subscribe) for consumers that
 * should be able to emit events without also being able to listen for them —
 * interface segregation. No implementation exists yet.
 */
export interface EventPublisher {
  publish<TPayload>(event: DomainEvent<TPayload> | ApplicationEvent<TPayload>): Promise<void>;
}
