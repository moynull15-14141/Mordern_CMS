import { describe, expect, it } from 'vitest';
import { capitalize, initials, slugify, titleCase } from './string';

describe('capitalize', () => {
  it('uppercases the first character only', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });

  it('returns an empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips diacritics', () => {
    expect(slugify('Café Résumé')).toBe('cafe-resume');
  });

  it('collapses non-alphanumeric runs into a single hyphen', () => {
    expect(slugify('foo & bar!! baz')).toBe('foo-bar-baz');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --hello--  ')).toBe('hello');
  });
});

describe('titleCase', () => {
  it('capitalizes every word split on spaces, hyphens, and underscores', () => {
    expect(titleCase('hello_world-foo bar')).toBe('Hello World Foo Bar');
  });

  it('filters out empty segments', () => {
    expect(titleCase('  hello   world  ')).toBe('Hello World');
  });
});

describe('initials', () => {
  it('returns the first letter of up to maxChars words', () => {
    expect(initials('John Smith')).toBe('JS');
  });

  it('respects a custom maxChars', () => {
    expect(initials('John Middle Smith', 3)).toBe('JMS');
  });

  it('handles a single name', () => {
    expect(initials('Cher')).toBe('C');
  });
});
