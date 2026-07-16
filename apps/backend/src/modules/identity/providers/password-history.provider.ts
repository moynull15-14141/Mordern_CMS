/**
 * Foundation only (Milestone 4.1 §4) — interface, no implementation. No
 * `password_history` table, no repository, no queries exist yet.
 *
 * Future implementation notes: once built, `record()` would be called
 * after a successful password change (alongside PasswordService.hash) to
 * append the new hash, and `wasPreviouslyUsed()` would be checked in
 * ResetPasswordDto's flow before accepting a new password, rejecting reuse
 * of the last N hashes (N configurable). None of that exists yet.
 */
export interface PasswordHistoryEntry {
  passwordHash: string;
  createdAt: Date;
}

export interface PasswordHistoryProvider {
  record(userId: string, passwordHash: string): Promise<void>;
  wasPreviouslyUsed(userId: string, candidatePasswordHash: string): Promise<boolean>;
}
