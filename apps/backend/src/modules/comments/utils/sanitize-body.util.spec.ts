import { sanitizeCommentBody, stripHtmlTags } from './sanitize-body.util';

describe('stripHtmlTags', () => {
  it('removes simple tags', () => {
    expect(stripHtmlTags('<b>hello</b>')).toBe('hello');
  });

  it('removes script tags and their content markers (tags only, not text)', () => {
    expect(stripHtmlTags('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('removes attributes along with the tag', () => {
    expect(stripHtmlTags('<img src=x onerror=alert(1)>')).toBe('');
  });

  it('leaves plain text untouched', () => {
    expect(stripHtmlTags('just plain text')).toBe('just plain text');
  });

  it('removes multiple tags across the string', () => {
    expect(stripHtmlTags('<p>a</p><p>b</p>')).toBe('ab');
  });

  it('handles an empty string', () => {
    expect(stripHtmlTags('')).toBe('');
  });
});

describe('sanitizeCommentBody', () => {
  it('strips tags and trims whitespace', () => {
    expect(sanitizeCommentBody('  <b>hi</b>  ')).toBe('hi');
  });

  it('results in empty string when body was only markup', () => {
    expect(sanitizeCommentBody('<script></script>')).toBe('');
  });

  it('preserves internal whitespace between words', () => {
    expect(sanitizeCommentBody('hello world')).toBe('hello world');
  });
});
