import { describe, expect, it } from 'vitest';
import { buildThemeExport, parseThemeImport } from './theme-export';
import type { Theme } from '../types/theme';

function buildTheme(overrides: Partial<Theme> = {}): Theme {
  return {
    id: 'theme-1',
    name: 'Classic',
    slug: 'classic',
    version: '1.0.0',
    author: 'Acme',
    description: 'A classic theme.',
    thumbnail: null,
    status: 'PUBLISHED',
    isActive: true,
    settings: {
      primaryColor: '#111827',
      designTokens: { colors: { brand: { primary: '#111827' } } },
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

describe('buildThemeExport', () => {
  it('never includes id/status/isActive/audit fields', () => {
    const file = buildThemeExport(buildTheme()) as unknown as Record<string, unknown>;
    expect(file).not.toHaveProperty('id');
    expect(file).not.toHaveProperty('status');
    expect(file).not.toHaveProperty('isActive');
    expect(file).not.toHaveProperty('createdAt');
    expect(file).not.toHaveProperty('updatedAt');
    expect(file).not.toHaveProperty('deletedAt');
  });

  it('includes name/version/author/description/settings', () => {
    const file = buildThemeExport(buildTheme());
    expect(file).toMatchObject({
      exportVersion: 1,
      name: 'Classic',
      version: '1.0.0',
      author: 'Acme',
      description: 'A classic theme.',
    });
    expect(file.settings).toMatchObject({ primaryColor: '#111827' });
  });
});

describe('parseThemeImport', () => {
  it('parses a valid export file into a CreateThemeInput', () => {
    const file = buildThemeExport(buildTheme());
    const result = parseThemeImport(JSON.stringify(file));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.input.name).toBe('Classic');
      expect(result.input.settings).toMatchObject({ primaryColor: '#111827' });
    }
  });

  it('rejects invalid JSON', () => {
    const result = parseThemeImport('not json{{{');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain('not valid JSON');
  });

  it('rejects a file missing "name"', () => {
    const result = parseThemeImport(JSON.stringify({ settings: {} }));
    expect(result.success).toBe(false);
  });

  it('rejects a file whose settings is not an object', () => {
    const result = parseThemeImport(JSON.stringify({ name: 'X', settings: 'not-an-object' }));
    expect(result.success).toBe(false);
  });

  it('accepts a file with no settings at all', () => {
    const result = parseThemeImport(JSON.stringify({ name: 'Bare Theme' }));
    expect(result.success).toBe(true);
  });

  it('never carries over id/status/isActive even if present in the uploaded file (defense against a hand-edited/malicious file)', () => {
    const result = parseThemeImport(
      JSON.stringify({
        name: 'X',
        id: 'someone-elses-id',
        status: 'PUBLISHED',
        isActive: true,
        siteId: 'other-site',
      })
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.input).not.toHaveProperty('id');
      expect(result.input).not.toHaveProperty('status');
      expect(result.input).not.toHaveProperty('isActive');
      expect(result.input).not.toHaveProperty('siteId');
    }
  });
});
