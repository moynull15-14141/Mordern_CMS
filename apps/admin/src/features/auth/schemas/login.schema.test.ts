import { describe, expect, it } from 'vitest';
import { loginSchema } from './login.schema';

describe('loginSchema', () => {
  it('accepts a valid email/password pair', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Enter a valid email address.');
    }
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Password is required.');
    }
  });

  it('does not enforce the full password policy on login (matches backend LoginDto)', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x' });
    expect(result.success).toBe(true);
  });

  it('treats rememberMe as optional', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x' });
    expect(result.success).toBe(true);
  });

  it('accepts an explicit rememberMe boolean', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'x', rememberMe: true });
    expect(result.success).toBe(true);
  });
});
