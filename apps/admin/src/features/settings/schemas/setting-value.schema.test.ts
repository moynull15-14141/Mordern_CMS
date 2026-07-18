import { describe, expect, it } from 'vitest';
import { buildSettingValueSchema } from './setting-value.schema';

describe('buildSettingValueSchema', () => {
  it('NUMBER coerces numeric strings and rejects non-numeric ones', () => {
    const schema = buildSettingValueSchema('NUMBER');
    expect(schema.safeParse('42').success).toBe(true);
    expect(schema.safeParse('not-a-number').success).toBe(false);
  });

  it('BOOLEAN accepts only real booleans', () => {
    const schema = buildSettingValueSchema('BOOLEAN');
    expect(schema.safeParse(true).success).toBe(true);
    expect(schema.safeParse('true').success).toBe(false);
  });

  it('ARRAY accepts an array of strings and rejects a plain string', () => {
    const schema = buildSettingValueSchema('ARRAY');
    expect(schema.safeParse(['a', 'b']).success).toBe(true);
    expect(schema.safeParse('a').success).toBe(false);
  });

  it('JSON accepts a plain object and rejects an array', () => {
    const schema = buildSettingValueSchema('JSON');
    expect(schema.safeParse({ a: 1 }).success).toBe(true);
    expect(schema.safeParse([1, 2]).success).toBe(false);
  });

  it('EMAIL accepts a valid email and an empty string, rejects garbage', () => {
    const schema = buildSettingValueSchema('EMAIL');
    expect(schema.safeParse('a@b.com').success).toBe(true);
    expect(schema.safeParse('').success).toBe(true);
    expect(schema.safeParse('not-an-email').success).toBe(false);
  });

  it('URL accepts a valid URL and an empty string, rejects garbage', () => {
    const schema = buildSettingValueSchema('URL');
    expect(schema.safeParse('https://example.com').success).toBe(true);
    expect(schema.safeParse('').success).toBe(true);
    expect(schema.safeParse('not-a-url').success).toBe(false);
  });

  it('COLOR accepts a 6-digit hex color and rejects other formats', () => {
    const schema = buildSettingValueSchema('COLOR');
    expect(schema.safeParse('#0f172a').success).toBe(true);
    expect(schema.safeParse('blue').success).toBe(false);
    expect(schema.safeParse('#fff').success).toBe(false);
  });

  it.each(['STRING', 'TEXT', 'PASSWORD', 'SECRET', 'FILE_REFERENCE'] as const)(
    '%s falls back to a plain string schema',
    (type) => {
      const schema = buildSettingValueSchema(type);
      expect(schema.safeParse('anything').success).toBe(true);
      expect(schema.safeParse(123).success).toBe(false);
    }
  );
});
