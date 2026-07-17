import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  formatNumber,
  formatRelativeTime,
  truncate,
} from './format';

describe('formatDate', () => {
  it('formats a valid ISO string', () => {
    expect(formatDate('2026-01-15T00:00:00.000Z')).toMatch(/2026/);
  });

  it('formats a Date instance', () => {
    expect(formatDate(new Date('2026-01-15'))).toMatch(/2026/);
  });

  it('returns an em dash for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('includes both date and time', () => {
    const result = formatDateTime('2026-01-15T10:30:00.000Z');
    expect(result).toMatch(/2026/);
  });
});

describe('formatRelativeTime', () => {
  it('returns an em dash for an invalid date', () => {
    expect(formatRelativeTime('nope')).toBe('—');
  });

  it('formats a near-past timestamp in seconds', () => {
    const result = formatRelativeTime(new Date(Date.now() - 5000));
    expect(result).toMatch(/second/);
  });

  it('formats a far-future timestamp in years', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 5);
    expect(formatRelativeTime(future)).toMatch(/year/);
  });
});

describe('formatNumber', () => {
  it('formats with thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(19.99)).toBe('$19.99');
  });

  it('supports an alternate currency', () => {
    expect(formatCurrency(10, 'EUR')).toContain('10.00');
  });
});

describe('formatFileSize', () => {
  it('returns 0 B for zero or negative values', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(-5)).toBe('0 B');
  });

  it('formats bytes without a decimal', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes with one decimal', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024 * 2)).toBe('2.0 MB');
  });
});

describe('truncate', () => {
  it('returns the original string when within maxLength', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  it('truncates and appends an ellipsis when exceeding maxLength', () => {
    expect(truncate('this is a long string', 10)).toBe('this is a…');
  });
});
