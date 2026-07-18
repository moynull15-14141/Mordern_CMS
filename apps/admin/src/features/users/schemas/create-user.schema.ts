import { z } from 'zod';

/**
 * Mirrors `CreateUserDto` exactly
 * (apps/backend/src/modules/users/dto/create-user.dto.ts): `email` required,
 * `username`/`displayName`/`password` all optional. No `status`/`role`
 * field — the backend DTO has none; a created user is always `PENDING`
 * (docs/63_FRONTEND_USERS.md).
 */
export const createUserSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  username: z.string().max(50, 'Username must be 50 characters or fewer.').optional().or(z.literal('')),
  displayName: z
    .string()
    .max(150, 'Display name must be 150 characters or fewer.')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      'At least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.',
    )
    .optional()
    .or(z.literal('')),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
