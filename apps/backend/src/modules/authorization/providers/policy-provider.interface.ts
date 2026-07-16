import { Policy } from '../policies/policy.interface';

/**
 * Foundation only (Milestone 5) — interface, no implementation, no DI
 * binding. A future registry that would let `AuthorizationService.can()`
 * look up and consult a named Policy (ArticlePolicy, MediaPolicy, ...)
 * instead of a flat permission check.
 */
export interface PolicyProvider {
  getPolicy<TSubject = unknown>(name: string): Policy<TSubject> | undefined;
}
