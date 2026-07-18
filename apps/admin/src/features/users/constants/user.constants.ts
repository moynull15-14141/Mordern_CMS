import type { ProfileVisibility, ThemePreference, UserSortField, UserStatus } from '../types/user';

/** Status Colors — docs/57_DESIGN_SYSTEM.md: `UserStatus` maps 1:1 onto the
 * real backend enum, never an invented status. */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  PENDING: 'Pending',
};

/** docs/57_DESIGN_SYSTEM.md's Status Colors table names "muted" for
 * INACTIVE — the real `Badge` component (`components/ui/badge.tsx`) has no
 * `muted` variant, only `default/secondary/outline/success/warning/info/destructive`.
 * `secondary` is the closest de-emphasized equivalent already implemented. */
export const USER_STATUS_BADGE_VARIANT: Record<UserStatus, 'success' | 'secondary' | 'destructive' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  SUSPENDED: 'destructive',
  PENDING: 'warning',
};

export const USER_STATUS_OPTIONS: { value: UserStatus; label: string }[] = (
  Object.keys(USER_STATUS_LABELS) as UserStatus[]
).map((value) => ({ value, label: USER_STATUS_LABELS[value] }));

export const USER_SORT_FIELD_LABELS: Record<UserSortField, string> = {
  name: 'Name',
  email: 'Email',
  createdAt: 'Created',
  updatedAt: 'Updated',
  lastLoginAt: 'Last Login',
  status: 'Status',
};

export const PROFILE_VISIBILITY_LABELS: Record<ProfileVisibility, string> = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
  TEAM: 'Team',
};

export const PROFILE_VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string }[] = (
  Object.keys(PROFILE_VISIBILITY_LABELS) as ProfileVisibility[]
).map((value) => ({ value, label: PROFILE_VISIBILITY_LABELS[value] }));

export const THEME_PREFERENCE_LABELS: Record<ThemePreference, string> = {
  LIGHT: 'Light',
  DARK: 'Dark',
  SYSTEM: 'System',
};

export const THEME_PREFERENCE_OPTIONS: { value: ThemePreference; label: string }[] = (
  Object.keys(THEME_PREFERENCE_LABELS) as ThemePreference[]
).map((value) => ({ value, label: THEME_PREFERENCE_LABELS[value] }));

export const USERS_DEFAULT_PAGE_SIZE = 20;
