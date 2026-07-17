import { z } from 'zod';

/**
 * Mirrors the backend's LoginDto exactly
 * (apps/backend/src/modules/identity/dto/login.dto.ts): email format +
 * password required only. Login deliberately does NOT enforce the full
 * password policy (min length/uppercase/number/special char) — that is
 * only enforced on reset-password's newPassword — since re-validating it
 * here would wrongly reject accounts created under a looser or
 * since-changed policy (docs/37_IDENTITY_FREEZE.md "Password Policy").
 */
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
