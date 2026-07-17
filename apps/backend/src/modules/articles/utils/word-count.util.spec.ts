import { computeWordCount } from './word-count.util';

describe('computeWordCount', () => {
  it('counts words in a plain string', () => {
    expect(computeWordCount('hello world foo')).toBe(3);
  });

  it('counts words across nested object values', () => {
    expect(
      computeWordCount({ heading: 'Hello World', paragraphs: ['one two', 'three four five'] })
    ).toBe(7);
  });

  it('returns 0 for an empty object', () => {
    expect(computeWordCount({})).toBe(0);
  });

  it('returns 0 for null', () => {
    expect(computeWordCount(null)).toBe(0);
  });

  it('handles arrays of objects', () => {
    expect(computeWordCount([{ text: 'a b' }, { text: 'c d e' }])).toBe(5);
  });
});
