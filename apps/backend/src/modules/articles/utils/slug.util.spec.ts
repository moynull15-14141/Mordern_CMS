import { generateSlugFromTitle, normalizeSlug, uniquifySlug } from './slug.util';

describe('slug.util', () => {
  describe('normalizeSlug', () => {
    it('lowercases and hyphenates', () => {
      expect(normalizeSlug('Hello World')).toBe('hello-world');
    });

    it('strips diacritics', () => {
      expect(normalizeSlug('Café Résumé')).toBe('cafe-resume');
    });

    it('collapses repeated separators', () => {
      expect(normalizeSlug('foo   bar---baz')).toBe('foo-bar-baz');
    });

    it('trims leading/trailing hyphens', () => {
      expect(normalizeSlug('  --hello--  ')).toBe('hello');
    });

    it('strips punctuation', () => {
      expect(normalizeSlug("It's a Test!")).toBe('it-s-a-test');
    });
  });

  describe('generateSlugFromTitle', () => {
    it('delegates to normalizeSlug', () => {
      expect(generateSlugFromTitle('My Great Article')).toBe('my-great-article');
    });
  });

  describe('uniquifySlug', () => {
    it('returns the base slug when not taken', async () => {
      const result = await uniquifySlug('hello', async () => false, 10);
      expect(result).toBe('hello');
    });

    it('appends -2 when the base is taken once', async () => {
      const taken = new Set(['hello']);
      const result = await uniquifySlug('hello', async (c) => taken.has(c), 10);
      expect(result).toBe('hello-2');
    });

    it('keeps incrementing until a free slug is found', async () => {
      const taken = new Set(['hello', 'hello-2', 'hello-3']);
      const result = await uniquifySlug('hello', async (c) => taken.has(c), 10);
      expect(result).toBe('hello-4');
    });

    it('throws after exceeding maxAttempts', async () => {
      await expect(uniquifySlug('hello', async () => true, 2)).rejects.toThrow();
    });
  });
});
