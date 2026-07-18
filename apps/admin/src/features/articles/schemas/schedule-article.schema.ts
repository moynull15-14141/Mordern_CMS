import { z } from 'zod';

/** Mirrors `ScheduleArticleDto` — `scheduledAt` must be a future ISO
 * date-time; the "future" constraint is enforced client-side for fast
 * feedback, matching the backend's own `@IsDateString()` + service-level
 * future-date check. */
export const scheduleArticleSchema = z.object({
  scheduledAt: z
    .string()
    .min(1, 'Scheduled date/time is required.')
    .refine((value) => new Date(value).getTime() > Date.now(), 'Must be a future date and time.'),
});

export type ScheduleArticleFormValues = z.infer<typeof scheduleArticleSchema>;
