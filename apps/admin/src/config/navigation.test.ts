import { describe, expect, it } from 'vitest';
import { flattenNavigation, NAVIGATION } from './navigation';

describe('NAVIGATION', () => {
  it('every item has a non-empty id, label, and href', () => {
    NAVIGATION.forEach((group) => {
      group.items.forEach((item) => {
        expect(item.id).toBeTruthy();
        expect(item.label).toBeTruthy();
        expect(item.href).toBeTruthy();
      });
    });
  });

  it('has no duplicate group ids', () => {
    const ids = NAVIGATION.map((group) => group.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no duplicate item ids across the whole manifest', () => {
    const ids = flattenNavigation().map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('flattenNavigation', () => {
  it('flattens every top-level item across all groups', () => {
    const flat = flattenNavigation();
    const expectedCount = NAVIGATION.reduce((total, group) => total + group.items.length, 0);
    expect(flat.length).toBeGreaterThanOrEqual(expectedCount);
  });

  it('defaults to the module-level NAVIGATION manifest when called with no args', () => {
    expect(flattenNavigation()).toEqual(flattenNavigation(NAVIGATION));
  });

  it('accepts a custom group list', () => {
    const custom = [{ id: 'g', label: 'G', items: [{ id: 'x', label: 'X', href: '/x' }] }];
    expect(flattenNavigation(custom)).toEqual([{ id: 'x', label: 'X', href: '/x' }]);
  });
});
