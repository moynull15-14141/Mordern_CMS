import { describe, expect, it } from 'vitest';
import { isKnownLayoutPresetName, LAYOUT_PRESET_NAMES } from './layout-preset.types';

describe('isKnownLayoutPresetName', () => {
  it.each(LAYOUT_PRESET_NAMES)('recognizes the registered preset "%s"', (preset) => {
    expect(isKnownLayoutPresetName(preset)).toBe(true);
  });

  it('rejects an unrecognized string', () => {
    expect(isKnownLayoutPresetName('some-future-preset')).toBe(false);
  });

  it('rejects null and undefined', () => {
    expect(isKnownLayoutPresetName(null)).toBe(false);
    expect(isKnownLayoutPresetName(undefined)).toBe(false);
  });
});
