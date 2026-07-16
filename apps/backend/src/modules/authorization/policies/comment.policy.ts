import { Policy } from './policy.interface';

/** Foundation only — no implementation. */
export interface CommentPolicySubject {
  userId: string | null;
}

export type CommentPolicy = Policy<CommentPolicySubject>;
