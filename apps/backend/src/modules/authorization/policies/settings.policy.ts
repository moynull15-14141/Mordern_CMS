import { Policy } from './policy.interface';

/** Foundation only — no implementation. Settings have no natural "owner",
 * so the subject is unit — access is role/permission gated only. */
export type SettingsPolicy = Policy<void>;
