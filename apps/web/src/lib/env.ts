import { z } from 'zod';

/**
 * Typed, validated access to the backend base URL — mirrors
 * `apps/admin/src/lib/env.ts`'s fail-fast philosophy. Deliberately
 * `API_BASE_URL`, not `NEXT_PUBLIC_API_BASE_URL`: every fetch this app
 * makes happens in Server Components/services (docs/74_PUBLIC_RENDERING_FOUNDATION.md
 * "Performance" — Server Components first), never in the browser, so the
 * value has no reason to be exposed to the client bundle.
 */
const envSchema = z.object({
  API_BASE_URL: z.string().url(),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    API_BASE_URL: process.env.API_BASE_URL,
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
