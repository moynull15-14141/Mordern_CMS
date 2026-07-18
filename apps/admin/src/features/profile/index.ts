/** Public surface for the Profile feature — self-service only, split from
 * `features/users` per approved decision 9 (docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface"). */
export { ProfileCard } from './components/profile-card';
export { PasswordForm } from './components/password-form';
export { EditProfileForm } from './components/edit-profile-form';
export { PreferencesForm } from './components/preferences-form';

// Page-level compositions — the only things `app/` actually imports.
export { ProfilePageContent } from './components/profile-page-content';
export { EditProfilePageContent } from './components/edit-profile-page-content';
export { ChangePasswordPageContent } from './components/change-password-page-content';

export { useProfile } from './hooks/use-profile';
export { useChangePassword } from './hooks/use-change-password';
export { useUpdateProfile } from './hooks/use-update-profile';
export { useUpdatePreferences } from './hooks/use-update-preferences';
export { useRemoveAvatar } from './hooks/use-remove-avatar';
