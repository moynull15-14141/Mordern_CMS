import { describe, expect, it } from 'vitest';
import { resolveChromePosition } from './resolve-chrome-position.util';

describe('resolveChromePosition', () => {
  it('returns "sticky" for "fixed" (case-insensitive, trimmed)', () => {
    expect(resolveChromePosition('fixed')).toBe('sticky');
    expect(resolveChromePosition('Fixed')).toBe('sticky');
    expect(resolveChromePosition('  FIXED  ')).toBe('sticky');
  });

  it('returns "static" for null', () => {
    expect(resolveChromePosition(null)).toBe('static');
  });

  it('returns "static" for any other value', () => {
    expect(resolveChromePosition('static')).toBe('static');
    expect(resolveChromePosition('sticky')).toBe('static');
    expect(resolveChromePosition('')).toBe('static');
  });
});
