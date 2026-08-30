import {
  isInternalPath,
  isValidDestination,
  isValidSourcePath,
  normalizeSourcePath,
} from './redirect-path.util';

describe('normalizeSourcePath', () => {
  it('adds a leading slash when missing', () => {
    expect(normalizeSourcePath('old-about')).toBe('/old-about');
  });

  it('strips a trailing slash (except the root path)', () => {
    expect(normalizeSourcePath('/old-about/')).toBe('/old-about');
    expect(normalizeSourcePath('/')).toBe('/');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeSourcePath('  /old-about  ')).toBe('/old-about');
  });

  it('throws on an empty path', () => {
    expect(() => normalizeSourcePath('')).toThrow();
    expect(() => normalizeSourcePath('   ')).toThrow();
  });

  it('throws on a path traversal segment', () => {
    expect(() => normalizeSourcePath('/foo/../bar')).toThrow();
  });

  it('throws on a javascript: scheme', () => {
    expect(() => normalizeSourcePath('javascript:alert(1)')).toThrow();
  });

  it('throws on a data: scheme', () => {
    expect(() => normalizeSourcePath('data:text/html,x')).toThrow();
  });
});

describe('isValidSourcePath', () => {
  it('returns true for a normal path', () => {
    expect(isValidSourcePath('/old-about')).toBe(true);
  });

  it('returns false for an unsafe scheme', () => {
    expect(isValidSourcePath('javascript:alert(1)')).toBe(false);
  });
});

describe('isValidDestination', () => {
  it('accepts an internal path', () => {
    expect(isValidDestination('/about')).toBe(true);
  });

  it('rejects an internal path with a traversal segment', () => {
    expect(isValidDestination('/foo/../bar')).toBe(false);
  });

  it('accepts a real https:// URL', () => {
    expect(isValidDestination('https://example.com/promo')).toBe(true);
  });

  it('accepts a real http:// URL', () => {
    expect(isValidDestination('http://example.com')).toBe(true);
  });

  it('rejects a javascript: URL', () => {
    expect(isValidDestination('javascript:alert(1)')).toBe(false);
  });

  it('rejects a data: URL', () => {
    expect(isValidDestination('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('rejects a bare domain with no scheme (ambiguous, not a path)', () => {
    expect(isValidDestination('example.com')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidDestination('')).toBe(false);
  });
});

describe('isInternalPath', () => {
  it('is true for a leading-slash path', () => {
    expect(isInternalPath('/about')).toBe(true);
  });

  it('is false for an external URL', () => {
    expect(isInternalPath('https://example.com')).toBe(false);
  });
});
