import { describe, expect, it } from 'vitest';
import { formatFileSize } from './format-filesize';

describe('formatFileSize', () => {
  it('formats bytes under 1024 as-is', () => {
    expect(formatFileSize('500')).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize('2048')).toBe('2.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(String(5 * 1024 * 1024))).toBe('5.0 MB');
  });

  it('formats gigabytes', () => {
    expect(formatFileSize(String(2 * 1024 * 1024 * 1024))).toBe('2.0 GB');
  });

  it('returns the raw string for a non-numeric value', () => {
    expect(formatFileSize('not-a-number')).toBe('not-a-number');
  });
});
