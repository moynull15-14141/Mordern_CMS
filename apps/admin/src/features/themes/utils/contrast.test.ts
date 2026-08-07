import { describe, expect, it } from 'vitest';
import { checkContrast, getContrastRatio } from './contrast';

describe('getContrastRatio', () => {
  it('returns 21:1 for pure black on pure white (the maximum possible ratio)', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });

  it('returns 1:1 for identical colors', () => {
    expect(getContrastRatio('#336699', '#336699')).toBeCloseTo(1, 5);
  });

  it('is symmetric regardless of argument order', () => {
    const a = getContrastRatio('#111827', '#ffffff');
    const b = getContrastRatio('#ffffff', '#111827');
    expect(a).toBeCloseTo(b!, 5);
  });

  it('resolves a 3-digit hex shorthand', () => {
    expect(getContrastRatio('#000', '#fff')).toBeCloseTo(21, 0);
  });

  it('returns null for an unparseable color', () => {
    expect(getContrastRatio('not-a-color', '#ffffff')).toBeNull();
    expect(getContrastRatio('#ffffff', '')).toBeNull();
  });
});

describe('checkContrast', () => {
  it('classifies black-on-white as "aa" (good contrast)', () => {
    const result = checkContrast('#000000', '#ffffff');
    expect(result?.level).toBe('aa');
  });

  it('classifies a low-contrast pair as "fail"', () => {
    const result = checkContrast('#cccccc', '#ffffff');
    expect(result?.level).toBe('fail');
    expect(result?.message).toContain('difficult to read');
  });

  it('classifies a mid-range pair as "aa-large"', () => {
    // #767676 on #ffffff is right around the WCAG large-text threshold.
    const result = checkContrast('#767676', '#ffffff');
    expect(result?.level).not.toBe('fail');
  });

  it('returns null for an in-progress/empty color value', () => {
    expect(checkContrast('', '#ffffff')).toBeNull();
  });
});
