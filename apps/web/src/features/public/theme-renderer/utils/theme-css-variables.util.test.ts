import { describe, expect, it } from 'vitest';
import { buildExtendedThemeCssVariables } from './theme-css-variables.util';
import type { PublicTheme } from '../../types/theme.types';

function buildTheme(overrides: Partial<PublicTheme> = {}): PublicTheme {
  return {
    id: 't1',
    name: 'Theme',
    slug: 'theme',
    version: null,
    logo: null,
    favicon: null,
    colors: { primary: '#111827', secondary: null },
    typography: null,
    layout: {
      header: null,
      footer: null,
      containerWidth: '1200px',
      borderRadius: '0.5rem',
      buttonStyle: null,
      homepage: null,
      blog: null,
    },
    customCss: null,
    customJs: null,
    ...overrides,
  };
}

describe('buildExtendedThemeCssVariables', () => {
  it('returns an empty object for a null theme', () => {
    expect(buildExtendedThemeCssVariables(null)).toEqual({});
  });

  it('includes primary/secondary/radius/container-width when set', () => {
    const result = buildExtendedThemeCssVariables(
      buildTheme({ colors: { primary: '#111827', secondary: '#6b7280' } })
    );
    expect(result['--sportingspy-color-primary']).toBe('#111827');
    expect(result['--sportingspy-color-secondary']).toBe('#6b7280');
    expect(result['--sportingspy-radius']).toBe('0.5rem');
    expect(result['--sportingspy-container-width']).toBe('1200px');
  });

  it('derives accent from secondary when secondary is set', () => {
    const result = buildExtendedThemeCssVariables(
      buildTheme({ colors: { primary: '#111827', secondary: '#6b7280' } })
    );
    expect(result['--sportingspy-color-accent']).toBe('#6b7280');
  });

  it('derives accent from primary when secondary is null (real data only, no invented color)', () => {
    const result = buildExtendedThemeCssVariables(
      buildTheme({ colors: { primary: '#111827', secondary: null } })
    );
    expect(result['--sportingspy-color-accent']).toBe('#111827');
  });

  it('omits font-family when typography has no fontFamily key', () => {
    const result = buildExtendedThemeCssVariables(buildTheme({ typography: { weight: 'bold' } }));
    expect(result).not.toHaveProperty('--sportingspy-font-family');
  });

  it('extracts font-family defensively when typography.fontFamily is a real string', () => {
    const result = buildExtendedThemeCssVariables(
      buildTheme({ typography: { fontFamily: 'Inter, sans-serif' } })
    );
    expect(result['--sportingspy-font-family']).toBe('Inter, sans-serif');
  });

  it('ignores a non-string fontFamily value rather than throwing', () => {
    const result = buildExtendedThemeCssVariables(
      buildTheme({
        typography: { fontFamily: { nested: true } } as unknown as Record<string, unknown>,
      })
    );
    expect(result).not.toHaveProperty('--sportingspy-font-family');
  });

  it('never produces the static design-system tokens (background/surface/border/text/muted/spacing) — those live only in globals.css', () => {
    const result = buildExtendedThemeCssVariables(buildTheme());
    expect(result).not.toHaveProperty('--sportingspy-color-background');
    expect(result).not.toHaveProperty('--sportingspy-color-surface');
    expect(result).not.toHaveProperty('--sportingspy-color-border');
    expect(result).not.toHaveProperty('--sportingspy-color-text');
    expect(result).not.toHaveProperty('--sportingspy-color-muted');
    expect(result).not.toHaveProperty('--sportingspy-spacing-md');
  });
});
