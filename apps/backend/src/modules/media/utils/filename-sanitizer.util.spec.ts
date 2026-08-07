import { buildStorageKey, isDangerousExtension, sanitizeFilename } from './filename-sanitizer.util';

describe('isDangerousExtension', () => {
  it.each(['virus.exe', 'script.sh', 'payload.php', 'macro.vbs', 'lib.dll'])(
    'flags %s as dangerous',
    (filename) => {
      expect(isDangerousExtension(filename)).toBe(true);
    }
  );

  it.each(['photo.png', 'video.mp4', 'doc.pdf', 'archive.zip'])('allows %s', (filename) => {
    expect(isDangerousExtension(filename)).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isDangerousExtension('VIRUS.EXE')).toBe(true);
  });

  it('treats a filename with no extension as safe', () => {
    expect(isDangerousExtension('README')).toBe(false);
  });
});

describe('sanitizeFilename', () => {
  it('strips path separators', () => {
    expect(sanitizeFilename('../../etc/passwd')).not.toContain('/');
    expect(sanitizeFilename('..\\..\\windows\\system32')).not.toContain('\\');
  });

  it('strips control characters and null bytes', () => {
    expect(sanitizeFilename('photo\x00.png')).toBe('photo.png');
  });

  it('strips leading dots (hidden-file / traversal-adjacent)', () => {
    expect(sanitizeFilename('...hidden.png')).toBe('hidden.png');
  });

  it('collapses internal whitespace runs', () => {
    expect(sanitizeFilename('my    photo.png')).toBe('my photo.png');
  });

  it('caps length at 200 characters', () => {
    const long = `${'a'.repeat(250)}.png`;
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(200);
  });

  it('falls back to "file" when nothing safe remains', () => {
    expect(sanitizeFilename('....')).toBe('file');
  });

  it('leaves an already-safe filename unchanged', () => {
    expect(sanitizeFilename('My Photo.png')).toBe('My Photo.png');
  });
});

describe('buildStorageKey', () => {
  it('builds a namespaced, collision-resistant key', () => {
    expect(buildStorageKey('site-1', 'asset-1', 'photo.png')).toBe(
      'uploads/site-1/asset-1/photo.png'
    );
  });
});
