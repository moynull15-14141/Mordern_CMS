import { z } from 'zod';

/**
 * Mirrors `UpdateProfileDto` exactly
 * (apps/backend/src/modules/users/dto/update-profile.dto.ts). Does NOT
 * include `email`/`username`/`displayName` — those are identity fields
 * with no self-service endpoint (docs/63_FRONTEND_USERS.md).
 */
export const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional().or(z.literal('')),
  lastName: z.string().max(100).optional().or(z.literal('')),
  phone: z.string().max(30).optional().or(z.literal('')),
  bio: z.string().max(1000).optional().or(z.literal('')),
  website: z.string().url('Enter a valid URL.').optional().or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
  language: z.string().optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  dateFormat: z.string().max(30).optional().or(z.literal('')),
  timeFormat: z.string().max(30).optional().or(z.literal('')),
  profileVisibility: z.enum(['PUBLIC', 'PRIVATE', 'TEAM']).optional(),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
