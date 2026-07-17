import {
  applyTrailingSlashStrategy,
  normalizeCanonicalUrl,
  removeDuplicateSlashes,
} from './canonical-url.util';

describe('removeDuplicateSlashes', () => {
  it('collapses consecutive slashes in the path', () => {
    expect(removeDuplicateSlashes('https://example.com/foo//bar')).toBe(
      'https://example.com/foo/bar'
    );
  });

  it('collapses three or more consecutive slashes', () => {
    expect(removeDuplicateSlashes('https://example.com/foo///bar')).toBe(
      'https://example.com/foo/bar'
    );
  });

  it('never touches the scheme separator', () => {
    expect(removeDuplicateSlashes('https://example.com/foo')).toBe('https://example.com/foo');
  });

  it('collapses a doubled root path down to a single slash', () => {
    expect(removeDuplicateSlashes('https://example.com//')).toBe('https://example.com/');
  });

  it('leaves a URL with no path untouched', () => {
    expect(removeDuplicateSlashes('https://example.com')).toBe('https://example.com');
  });

  it('falls back to a plain global collapse for non-scheme input', () => {
    expect(removeDuplicateSlashes('foo//bar')).toBe('foo/bar');
  });
});

describe('applyTrailingSlashStrategy', () => {
  it('removes a trailing slash from a non-root path', () => {
    expect(applyTrailingSlashStrategy('https://example.com/foo/')).toBe('https://example.com/foo');
  });

  it('keeps the single slash for the bare root path', () => {
    expect(applyTrailingSlashStrategy('https://example.com/')).toBe('https://example.com/');
  });

  it('leaves a URL with no path untouched', () => {
    expect(applyTrailingSlashStrategy('https://example.com')).toBe('https://example.com');
  });

  it('leaves a non-trailing-slash path untouched', () => {
    expect(applyTrailingSlashStrategy('https://example.com/foo')).toBe('https://example.com/foo');
  });

  it('handles a deep path with a trailing slash', () => {
    expect(applyTrailingSlashStrategy('https://example.com/a/b/c/')).toBe(
      'https://example.com/a/b/c'
    );
  });

  it('falls back to plain trailing-slash stripping for non-scheme input', () => {
    expect(applyTrailingSlashStrategy('/foo/')).toBe('/foo');
  });

  it('does not strip a lone slash for non-scheme input', () => {
    expect(applyTrailingSlashStrategy('/')).toBe('/');
  });
});

describe('normalizeCanonicalUrl', () => {
  it('trims, dedupes, and strips trailing slash in one pass', () => {
    expect(normalizeCanonicalUrl('  https://example.com/foo//bar/  ')).toBe(
      'https://example.com/foo/bar'
    );
  });

  it('preserves the root path exactly', () => {
    expect(normalizeCanonicalUrl('https://example.com//')).toBe('https://example.com/');
  });

  it('is idempotent — normalizing twice yields the same result', () => {
    const once = normalizeCanonicalUrl('https://example.com/foo//bar///baz/');
    const twice = normalizeCanonicalUrl(once);
    expect(twice).toBe(once);
  });

  it('leaves an already-normalized URL unchanged', () => {
    expect(normalizeCanonicalUrl('https://example.com/foo/bar')).toBe(
      'https://example.com/foo/bar'
    );
  });

  it('handles a URL with query string and path duplication before it', () => {
    expect(normalizeCanonicalUrl('https://example.com//foo?x=1')).toBe(
      'https://example.com/foo?x=1'
    );
  });
});
