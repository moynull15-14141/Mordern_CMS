import { describe, expect, it } from 'vitest';
import { getThemeRenderer } from './theme-registry';
import { LAYOUT_REGISTRY } from './layout-registry';

describe('getThemeRenderer', () => {
  it('resolves any real theme slug to the default renderer definition (only one exists today)', () => {
    const renderer = getThemeRenderer('mh-pollob');
    expect(renderer.layouts).toBe(LAYOUT_REGISTRY);
  });

  it('resolves null/undefined slug to the default renderer definition, never throwing', () => {
    expect(getThemeRenderer(null).layouts).toBe(LAYOUT_REGISTRY);
    expect(getThemeRenderer(undefined).layouts).toBe(LAYOUT_REGISTRY);
  });

  it('resolves an unregistered slug to the default renderer definition, never throwing', () => {
    expect(getThemeRenderer('some-marketplace-theme-not-registered-yet').layouts).toBe(
      LAYOUT_REGISTRY
    );
  });
});
