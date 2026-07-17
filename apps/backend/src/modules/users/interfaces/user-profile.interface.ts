import { ProfileVisibility } from '../constants/user.constants';

/**
 * Stored at `User.metadata.profile` (JSON) — no dedicated columns exist on
 * the frozen `User` model for any of these fields (see
 * docs/42_USER_MANAGEMENT_ARCHITECTURE.md "Why No New Columns").
 */
export interface UserProfile {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  bio?: string | null;
  website?: string | null;
  timezone?: string | null;
  language?: string | null;
  country?: string | null;
  city?: string | null;
  dateFormat?: string | null;
  timeFormat?: string | null;
  profileVisibility?: ProfileVisibility;
}
