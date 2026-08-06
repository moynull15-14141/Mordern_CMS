import { describe, expect, it } from 'vitest';
import { isSafeHref } from './safe-url.util';

describe('isSafeHref', () => {
  it('allows http/https/mailto/tel/relative/hash URLs', () => {
    expect(isSafeHref('https://example.com')).toBe(true);
    expect(isSafeHref('http://example.com')).toBe(true);
    expect(isSafeHref('mailto:a@example.com')).toBe(true);
    expect(isSafeHref('tel:+1234567890')).toBe(true);
    expect(isSafeHref('/relative/path')).toBe(true);
    expect(isSafeHref('#anchor')).toBe(true);
  });

  it('rejects javascript: and data: URLs', () => {
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
    expect(isSafeHref('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('is case-insensitive on scheme and tolerates leading whitespace', () => {
    expect(isSafeHref('  JavaScript:alert(1)')).toBe(false);
    expect(isSafeHref('HTTPS://example.com')).toBe(true);
  });
});
