import { afterEach, describe, expect, it, vi } from 'vitest';
import robots from './robots';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('robots', () => {
  it('disallows everything outside production (safe-by-default in dev)', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const result = robots();
    expect(result.rules).toEqual({ userAgent: '*', disallow: '/' });
    expect(result.sitemap).toBeUndefined();
  });

  it('allows crawling and points at the real sitemap in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DISALLOW_ROBOTS', '');
    const result = robots();
    expect(result.rules).toEqual({ userAgent: '*', allow: '/', disallow: ['/preview/'] });
    expect(result.sitemap).toBe('http://localhost:3002/sitemap.xml');
  });

  it('disallows everything in production when DISALLOW_ROBOTS=true (staging escape hatch)', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DISALLOW_ROBOTS', 'true');
    const result = robots();
    expect(result.rules).toEqual({ userAgent: '*', disallow: '/' });
  });
});
