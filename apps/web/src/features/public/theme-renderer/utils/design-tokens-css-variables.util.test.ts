import { describe, expect, it } from 'vitest';
import { buildDesignTokenCssVariables } from './design-tokens-css-variables.util';
import type { PublicTheme } from '../../types/theme.types';
import type { DesignTokens } from '../../types/design-tokens.types';

function buildTheme(designTokens: DesignTokens | null): PublicTheme {
  return {
    id: 't1',
    name: 'Theme',
    slug: 'theme',
    version: null,
    logo: null,
    favicon: null,
    colors: { primary: null, secondary: null },
    typography: null,
    layout: {
      header: null,
      footer: null,
      containerWidth: null,
      borderRadius: null,
      buttonStyle: null,
      homepage: null,
      blog: null,
    },
    customCss: null,
    customJs: null,
    designTokens,
  };
}

describe('buildDesignTokenCssVariables', () => {
  it('returns an empty object for a null theme', () => {
    expect(buildDesignTokenCssVariables(null)).toEqual({});
  });

  it('returns an empty object for a pre-M8 theme (designTokens null)', () => {
    expect(buildDesignTokenCssVariables(buildTheme(null))).toEqual({});
  });

  it('maps brand colors onto the existing --sportingspy-color-* variable names', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({
        colors: { brand: { primary: '#111827', secondary: '#6b7280', accent: '#f59e0b' } },
      })
    );
    expect(result['--sportingspy-color-primary']).toBe('#111827');
    expect(result['--sportingspy-color-secondary']).toBe('#6b7280');
    expect(result['--sportingspy-color-accent']).toBe('#f59e0b');
  });

  it('falls back accent to secondary when accent is unset', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({ colors: { brand: { secondary: '#6b7280' } } })
    );
    expect(result['--sportingspy-color-accent']).toBe('#6b7280');
  });

  it('maps background/text/border groups onto existing variable names', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({
        colors: {
          background: { page: '#ffffff', surface: '#f9fafb' },
          text: { primary: '#111827', muted: '#6b7280' },
          border: { default: '#e5e7eb' },
        },
      })
    );
    expect(result['--sportingspy-color-background']).toBe('#ffffff');
    expect(result['--sportingspy-color-surface']).toBe('#f9fafb');
    expect(result['--sportingspy-color-text']).toBe('#111827');
    expect(result['--sportingspy-color-muted']).toBe('#6b7280');
    expect(result['--sportingspy-color-border']).toBe('#e5e7eb');
  });

  it('maps new status colors onto new variable names', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({ colors: { status: { success: '#16a34a', error: '#dc2626' } } })
    );
    expect(result['--sportingspy-color-success']).toBe('#16a34a');
    expect(result['--sportingspy-color-error']).toBe('#dc2626');
  });

  it('maps typography font families and per-style values', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({
        typography: {
          fontFamilies: { body: 'Inter, sans-serif', heading: 'Poppins, sans-serif' },
          styles: { h1: { fontSize: '2.5rem', fontWeight: '700' }, body: { fontSize: '1rem' } },
        },
      })
    );
    expect(result['--sportingspy-font-family']).toBe('Inter, sans-serif');
    expect(result['--sportingspy-font-family-heading']).toBe('Poppins, sans-serif');
    expect(result['--sportingspy-h1-font-size']).toBe('2.5rem');
    expect(result['--sportingspy-h1-font-weight']).toBe('700');
    expect(result['--sportingspy-body-font-size']).toBe('1rem');
  });

  it('maps the extended spacing scale', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({ spacing: { xs: '0.25rem', xxxxl: '7rem' } })
    );
    expect(result['--sportingspy-spacing-xs']).toBe('0.25rem');
    expect(result['--sportingspy-spacing-xxxxl']).toBe('7rem');
  });

  it('maps container tokens', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({ container: { maxWidth: '1200px', sectionSpacing: '4rem' } })
    );
    expect(result['--sportingspy-container-width']).toBe('1200px');
    expect(result['--sportingspy-section-spacing']).toBe('4rem');
  });

  it('maps button tokens onto both --sportingspy-radius and --sportingspy-border-radius', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({ buttons: { radius: '0.75rem', height: '3rem' } })
    );
    expect(result['--sportingspy-radius']).toBe('0.75rem');
    expect(result['--sportingspy-border-radius']).toBe('0.75rem');
    expect(result['--sportingspy-button-height']).toBe('3rem');
  });

  it('maps card tokens, falling back to background/border/radius groups when unset', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({
        colors: { background: { surface: '#f9fafb' }, border: { default: '#e5e7eb' } },
        buttons: { radius: '0.5rem' },
        cards: { shadow: 'sm' },
      })
    );
    expect(result['--sportingspy-card-background']).toBe('#f9fafb');
    expect(result['--sportingspy-card-border']).toBe('#e5e7eb');
    expect(result['--sportingspy-card-radius']).toBe('0.5rem');
    expect(result['--sportingspy-card-shadow']).toBe('sm');
  });

  it('maps a solid page background onto both the dedicated and legacy background variables', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({ background: { type: 'solid', value: '#f0f0f0' } })
    );
    expect(result['--sportingspy-page-background']).toBe('#f0f0f0');
    expect(result['--sportingspy-color-background']).toBe('#f0f0f0');
  });

  it('maps an image page background as a url() value, without touching --sportingspy-color-background', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({ background: { type: 'image', value: 'https://example.com/bg.jpg' } })
    );
    expect(result['--sportingspy-page-background']).toBe('url(https://example.com/bg.jpg)');
    expect(result['--sportingspy-color-background']).toBeUndefined();
  });

  it('maps header/footer tokens', () => {
    const result = buildDesignTokenCssVariables(
      buildTheme({
        header: { height: '4rem', background: '#ffffff' },
        footer: { background: '#111827', textColor: '#ffffff' },
      })
    );
    expect(result['--sportingspy-header-height']).toBe('4rem');
    expect(result['--sportingspy-header-background']).toBe('#ffffff');
    expect(result['--sportingspy-footer-background']).toBe('#111827');
    expect(result['--sportingspy-footer-text']).toBe('#ffffff');
  });

  it('never emits a variable for an empty string', () => {
    const result = buildDesignTokenCssVariables(buildTheme({ colors: { brand: { primary: '' } } }));
    expect(result['--sportingspy-color-primary']).toBeUndefined();
  });
});
