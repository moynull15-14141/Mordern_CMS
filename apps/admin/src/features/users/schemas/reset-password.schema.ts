import { z } from 'zod';

const PASSWORD_POLICY_MESSAGE =
  'At least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.';
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/**
 * Mirrors `AdminResetPasswordDto` exactly
 * (apps/backend/src/modules/users/dto/admin-reset-password.dto.ts) — admin
 * reset, no current-password check. `confirmPassword` is a frontend-only
 * UX field, stripped before the request is sent (never part of the DTO).
 */
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().regex(PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE),
    confirmPassword: z.string().min(1, 'Please confirm the new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
