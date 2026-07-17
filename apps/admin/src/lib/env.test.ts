import { afterEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = process.env.NEXT_PUBLIC_API_BASE_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_API_BASE_URL = ORIGINAL_ENV;
  vi.resetModules();
});

describe('env', () => {
  it('exposes the validated NEXT_PUBLIC_API_BASE_URL', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:4000/api/v1';
    vi.resetModules();
    const { env } = await import('./env');
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBe('http://localhost:4000/api/v1');
  });

  it('throws at import time when the URL is missing', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = '';
    vi.resetModules();
    await expect(import('./env')).rejects.toThrow(/Invalid or missing environment variables/);
  });

  it('throws at import time when the value is not a valid URL', async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = 'not-a-url';
    vi.resetModules();
    await expect(import('./env')).rejects.toThrow(/Invalid or missing environment variables/);
  });
});
