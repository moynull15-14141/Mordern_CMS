/**
 * Interface only. No pub/sub implementation exists yet — Queue/Redis wiring
 * is explicitly out of scope for this milestone.
 */
export interface EventBus {
  publish<TPayload>(eventName: string, payload: TPayload): Promise<void>;
  subscribe<TPayload>(eventName: string, handler: (payload: TPayload) => Promise<void> | void): void;
}
