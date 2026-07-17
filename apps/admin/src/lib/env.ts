import { z } from 'zod';

/**
 * Typed, validated access to NEXT_PUBLIC_* env vars — mirrors the backend's
 * own fail-fast env.validation.ts philosophy (apps/backend/src/config/env.validation.ts)
 * on the frontend side. Exactly one variable exists for Frontend Milestone 1,
 * per the approved scope — no additional vars, no secrets (see .env.example).
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
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
