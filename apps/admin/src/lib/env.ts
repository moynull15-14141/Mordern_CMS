import { z } from 'zod';

/**
 * Typed, validated access to NEXT_PUBLIC_* env vars — mirrors the backend's
 * own fail-fast env.validation.ts philosophy (apps/backend/src/config/env.validation.ts)
 * on the frontend side. `NEXT_PUBLIC_WEB_URL` is optional (defaults to the
 * local `apps/web` dev port) — it's only used to build a "preview on site"
 * link (e.g. the Pattern Picker's Preview button), never for data fetching,
 * so a missing/wrong value degrades a convenience link rather than breaking
 * anything load-bearing.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_WEB_URL: z.string().url().default('http://localhost:3001'),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL || undefined,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Invalid or missing environment variables: ${issues}`);
  }

  return parsed.data;
}

export const env = loadEnv();
