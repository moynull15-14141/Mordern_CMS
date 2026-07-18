import { z } from 'zod';

const PASSWORD_POLICY_MESSAGE =
  'At least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.';
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

/**
 * Mirrors `ChangePasswordDto` exactly
 * (apps/backend/src/modules/users/dto/change-password.dto.ts) —
 * self-service, requires the current password. Used by
 * `POST /users/:id/change-password` when `id` is the caller's own id.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().regex(PASSWORD_POLICY_REGEX, PASSWORD_POLICY_MESSAGE),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
