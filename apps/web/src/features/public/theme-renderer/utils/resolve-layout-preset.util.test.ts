import { describe, expect, it } from 'vitest';
import { resolveLayoutPreset } from './resolve-layout-preset.util';
import type { PublicTheme } from '../../types/theme.types';

function buildTheme(overrides: Partial<PublicTheme['layout']> = {}): PublicTheme {
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
      ...overrides,
    },
    customCss: null,
    customJs: null,
  };
}

describe('resolveLayoutPreset', () => {
  it('returns "default" when theme is null, regardless of area', () => {
    expect(resolveLayoutPreset(null, 'home')).toBe('default');
    expect(resolveLayoutPreset(null, 'blog')).toBe('default');
  });

  it('always returns "default" for area "default", even if homepage/blog are set', () => {
    const theme = buildTheme({ homepage: 'sidebar-left', blog: 'boxed' });
    expect(resolveLayoutPreset(theme, 'default')).toBe('default');
  });

  it('reads theme.layout.homepage for area "home"', () => {
    const theme = buildTheme({ homepage: 'full-width' });
    expect(resolveLayoutPreset(theme, 'home')).toBe('full-width');
  });

  it('reads theme.layout.blog for area "blog"', () => {
    const theme = buildTheme({ blog: 'sidebar-right' });
    expect(resolveLayoutPreset(theme, 'blog')).toBe('sidebar-right');
  });

  it('falls back to "default" for an unrecognized string value (open-ended field, admin can type anything)', () => {
    const theme = buildTheme({ homepage: 'some-made-up-value' });
    expect(resolveLayoutPreset(theme, 'home')).toBe('default');
  });

  it('falls back to "default" when the relevant field is null', () => {
    const theme = buildTheme({ homepage: null });
    expect(resolveLayoutPreset(theme, 'home')).toBe('default');
  });

  it('recognizes every declared preset name', () => {
    const presets = [
      'default',
      'full-width',
      'boxed',
      'centered',
      'sidebar-left',
      'sidebar-right',
      'no-sidebar',
    ];
    for (const preset of presets) {
      const theme = buildTheme({ homepage: preset });
      expect(resolveLayoutPreset(theme, 'home')).toBe(preset);
    }
  });
});
