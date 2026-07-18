import { describe, expect, it } from 'vitest';
import { themeSettingsSchema } from './theme-settings.schema';

describe('themeSettingsSchema', () => {
  it('accepts an empty object (every field optional)', () => {
    expect(themeSettingsSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a valid 3-digit hex primaryColor', () => {
    expect(themeSettingsSchema.safeParse({ primaryColor: '#abc' }).success).toBe(true);
  });

  it('accepts a valid 6-digit hex primaryColor', () => {
    expect(themeSettingsSchema.safeParse({ primaryColor: '#a1b2c3' }).success).toBe(true);
  });

  it('accepts an empty-string primaryColor', () => {
    expect(themeSettingsSchema.safeParse({ primaryColor: '' }).success).toBe(true);
  });

  it('rejects a primaryColor with no leading #', () => {
    expect(themeSettingsSchema.safeParse({ primaryColor: '112233' }).success).toBe(false);
  });

  it('rejects a primaryColor with an invalid length', () => {
    expect(themeSettingsSchema.safeParse({ primaryColor: '#12345' }).success).toBe(false);
  });

  it('rejects an invalid secondaryColor', () => {
    expect(themeSettingsSchema.safeParse({ secondaryColor: 'not-a-color' }).success).toBe(false);
  });

  it('accepts an arbitrary typographyText string', () => {
    expect(
      themeSettingsSchema.safeParse({ typographyText: '{"fontFamily":"Inter"}' }).success
    ).toBe(true);
  });

  it('rejects a headerLayout over 100 characters', () => {
    expect(themeSettingsSchema.safeParse({ headerLayout: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects a containerWidth over 50 characters', () => {
    expect(themeSettingsSchema.safeParse({ containerWidth: 'a'.repeat(51) }).success).toBe(false);
  });

  it('accepts a valid customCss string', () => {
    expect(themeSettingsSchema.safeParse({ customCss: 'body { color: red; }' }).success).toBe(true);
  });

  it('rejects a customCss over 50000 characters', () => {
    expect(themeSettingsSchema.safeParse({ customCss: 'a'.repeat(50001) }).success).toBe(false);
  });
});
