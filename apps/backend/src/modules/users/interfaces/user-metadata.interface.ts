import { UserProfile } from './user-profile.interface';
import { UserPreferences } from './user-preferences.interface';

/** Tracks a "locked" state that has no equivalent value in the frozen
 * `UserStatus` enum (ACTIVE/INACTIVE/SUSPENDED/PENDING only — no LOCKED).
 * See docs/42_USER_MANAGEMENT_ARCHITECTURE.md "User Status Conflict". */
export interface UserSecurityMetadata {
  locked?: boolean;
  lockedAt?: string;
  lockedReason?: string;
  lockedBy?: string | null;
}

/** The full shape stored in `User.metadata: Json?` — the only extensibility
 * point the frozen schema provides for this module. */
export interface UserMetadata {
  profile?: UserProfile;
  preferences?: UserPreferences;
  security?: UserSecurityMetadata;
}
