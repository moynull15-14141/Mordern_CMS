import { ThemePreference } from '../constants/user.constants';

export interface NotificationPreference {
  email?: boolean;
  inApp?: boolean;
}

/** Stored at `User.metadata.preferences` (JSON) — same rationale as
 * UserProfile: no dedicated columns exist on the frozen `User` model. */
export interface UserPreferences {
  theme?: ThemePreference;
  language?: string;
  timezone?: string;
  editorPreference?: Record<string, unknown>;
  dashboardPreference?: Record<string, unknown>;
  notificationPreference?: NotificationPreference;
  accessibilityPreference?: Record<string, unknown>;
}
