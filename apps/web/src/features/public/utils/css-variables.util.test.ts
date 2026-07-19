import { describe, expect, it } from 'vitest';
import { buildThemeCssVariables } from './css-variables.util';
import type { PublicTheme } from '../types/theme.types';

const baseTheme: PublicTheme = {
  id: 't1',
  name: 'Default',
  slug: 'default',
  version: '1.0.0',
  logo: null,
  favicon: null,
  colors: { primary: '#111111', secondary: null },
  typography: null,
  layout: {
    header: null,
    footer: null,
    containerWidth: '1200px',
    borderRadius: null,
    buttonStyle: null,
    homepage: null,
    blog: null,
  },
  customCss: null,
  customJs: null,
};

describe('buildThemeCssVariables', () => {
  it('returns an empty object for a null theme', () => {
    expect(buildThemeCssVariables(null)).toEqual({});
  });

  it('includes only the fields that have a value', () => {
    expect(buildThemeCssVariables(baseTheme)).toEqual({
      '--sportingspy-color-primary': '#111111',
      '--sportingspy-container-width': '1200px',
    });
  });

  it('omits every null field entirely (never writes the string "null")', () => {
    const variables = buildThemeCssVariables(baseTheme);
    expect(variables).not.toHaveProperty('--sportingspy-color-secondary');
    expect(variables).not.toHaveProperty('--sportingspy-border-radius');
  });
});
