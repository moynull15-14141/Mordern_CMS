import { describe, expect, it } from 'vitest';
import { getLayoutComponent, LAYOUT_REGISTRY } from './layout-registry';
import { LAYOUT_PRESET_NAMES } from '../utils/layout-preset.types';
import { DefaultLayout } from '../layouts/default-layout';

describe('LAYOUT_REGISTRY / getLayoutComponent', () => {
  it('registers all 7 declared preset names, no more, no fewer', () => {
    expect(Object.keys(LAYOUT_REGISTRY).sort()).toEqual([...LAYOUT_PRESET_NAMES].sort());
  });

  it('getLayoutComponent("default") returns DefaultLayout', () => {
    expect(getLayoutComponent('default')).toBe(DefaultLayout);
  });

  it('every registered entry is a distinct component (no accidental aliasing beyond the documented no-sidebar/default pair)', () => {
    const components = Object.values(LAYOUT_REGISTRY);
    const unique = new Set(components);
    // default and no-sidebar are intentionally different components with
    // identical behavior (see no-sidebar-layout.tsx's doc comment) — every
    // other pairing should be a genuinely distinct component.
    expect(unique.size).toBe(components.length);
  });
});
