import { z } from 'zod';

/**
 * Mirrors `UpdateUserDto` exactly
 * (apps/backend/src/modules/users/dto/update-user.dto.ts) — identity fields
 * only. No `status`/`role` field exists on this DTO (docs/63_FRONTEND_USERS.md).
 */
export const updateUserSchema = z.object({
  username: z.string().max(50, 'Username must be 50 characters or fewer.').optional().or(z.literal('')),
  displayName: z
    .string()
    .max(150, 'Display name must be 150 characters or fewer.')
    .optional()
    .or(z.literal('')),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
