import { describe, expect, it } from 'vitest';
import { DESIGN_PRESETS, getDesignPreset } from './design-presets';
import { designTokensSchema } from '../schemas/design-tokens.schema';

describe('DESIGN_PRESETS', () => {
  it('has at least the 6 presets named in the Milestone 8 spec (Modern/Minimal/Corporate/Editorial/Creative/Travel)', () => {
    const ids = DESIGN_PRESETS.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining(['modern', 'minimal', 'corporate', 'editorial', 'creative', 'travel'])
    );
  });

  it('every preset has a unique id', () => {
    const ids = DESIGN_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every preset stamps its own id into tokens.preset', () => {
    for (const p of DESIGN_PRESETS) {
      expect(p.tokens.preset).toBe(p.id);
    }
  });

  it('every preset validates against the real designTokensSchema', () => {
    for (const p of DESIGN_PRESETS) {
      const result = designTokensSchema.safeParse(p.tokens);
      expect(result.success).toBe(true);
    }
  });

  it('every preset sets brand primary/secondary colors as valid 6-digit hex', () => {
    for (const p of DESIGN_PRESETS) {
      expect(p.tokens.colors?.brand?.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(p.tokens.colors?.brand?.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('getDesignPreset', () => {
  it('finds a preset by id', () => {
    expect(getDesignPreset('minimal')?.label).toBe('Minimal');
  });

  it('returns undefined for an unknown id', () => {
    expect(getDesignPreset('nonexistent')).toBeUndefined();
  });
});
