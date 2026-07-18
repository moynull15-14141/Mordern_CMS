/** Public surface for the Users feature — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface": only what `app/` actually needs. */
export { UserTable } from './components/user-table';
export { UserFilters, type UserFiltersValue } from './components/user-filters';
export { CreateUserForm, EditUserForm } from './components/user-form';
export { StatusBadge } from './components/status-badge';
export { THEME_PREFERENCE_OPTIONS, PROFILE_VISIBILITY_OPTIONS } from './constants/user.constants';
export { UserAvatar } from './components/user-avatar';
export { SessionTable } from './components/session-table';
export { DeleteDialog } from './components/delete-dialog';
export { RestoreDialog } from './components/restore-dialog';
export { ResetPasswordDialog } from './components/reset-password-dialog';

// Page-level compositions — the only things `app/` actually imports.
export { UsersPageContent } from './components/users-page-content';
export { CreateUserPageContent } from './components/create-user-page-content';
export { UserDetailPageContent } from './components/user-detail-page-content';
export { EditUserPageContent } from './components/edit-user-page-content';

export { useUsers } from './hooks/use-users';
export { useUser } from './hooks/use-user';
export { useCreateUser } from './hooks/use-create-user';
export { useUpdateUser } from './hooks/use-update-user';
export { useDeleteUser } from './hooks/use-delete-user';
export { useRestoreUser } from './hooks/use-restore-user';
export { useResetPassword } from './hooks/use-reset-password';
export { useUserSessions } from './hooks/use-user-sessions';
export { useTerminateSession } from './hooks/use-terminate-session';
export { useTerminateAllSessions } from './hooks/use-terminate-all-sessions';

export type {
  User,
  UserSession,
  UserStatus,
  UserProfile,
  UserPreferences,
  UserFilters as UserFiltersType,
  CreateUserInput,
  UpdateUserInput,
  UpdateProfileInput,
  UpdatePreferencesInput,
  ChangePasswordInput,
  AdminResetPasswordInput,
} from './types/user';
