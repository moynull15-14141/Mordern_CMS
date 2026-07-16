import { Policy } from './policy.interface';

/** Foundation only — no implementation. */
export interface MediaPolicySubject {
  uploadedBy: string;
}

export type MediaPolicy = Policy<MediaPolicySubject>;
