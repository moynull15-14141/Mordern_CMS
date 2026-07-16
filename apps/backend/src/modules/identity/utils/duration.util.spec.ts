import { addDuration, parseDurationMs } from './duration.util';

describe('duration.util', () => {
  describe('parseDurationMs', () => {
    it.each([
      ['15m', 15 * 60_000],
      ['1h', 60 * 60_000],
      ['7d', 7 * 24 * 60 * 60_000],
      ['30s', 30_000],
    ])('parses "%s" as %d ms', (input, expected) => {
      expect(parseDurationMs(input)).toBe(expected);
    });

    it('throws on an invalid format', () => {
      expect(() => parseDurationMs('bogus')).toThrow('Invalid duration format');
      expect(() => parseDurationMs('15')).toThrow('Invalid duration format');
      expect(() => parseDurationMs('15x')).toThrow('Invalid duration format');
    });
  });

  describe('addDuration', () => {
    it('adds the parsed duration to the given base date', () => {
      const from = new Date('2026-01-01T00:00:00.000Z');
      const result = addDuration('15m', from);
      expect(result.toISOString()).toBe('2026-01-01T00:15:00.000Z');
    });
  });
});
