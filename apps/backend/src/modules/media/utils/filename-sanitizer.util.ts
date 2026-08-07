/**
 * Extensions that must never be accepted for upload regardless of declared
 * MIME type — checked at request time (cheapest, earliest rejection),
 * before any bytes are transferred.
 */
export const DANGEROUS_EXTENSIONS = new Set([
  'exe',
  'bat',
  'cmd',
  'com',
  'msi',
  'msp',
  'scr',
  'ps1',
  'psm1',
  'vbs',
  'vbe',
  'js',
  'jse',
  'wsf',
  'wsh',
  'sh',
  'bash',
  'app',
  'jar',
  'apk',
  'dll',
  'so',
  'dylib',
  'php',
  'phtml',
  'asp',
  'aspx',
  'jsp',
  'cgi',
  'htaccess',
]);

const MAX_FILENAME_LENGTH = 200;

function getExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === filename.length - 1) return '';
  return filename.slice(dotIndex + 1).toLowerCase();
}

export function isDangerousExtension(filename: string): boolean {
  return DANGEROUS_EXTENSIONS.has(getExtension(filename));
}

/**
 * Strips path separators/control chars/null bytes, normalizes whitespace,
 * and caps length — feeds both the display filename and the generated
 * `storageKey`. Never trusts the client-supplied filename as a storage
 * locator on its own (see `buildStorageKey`).
 */
export function sanitizeFilename(filename: string): string {
  const withoutPathSeparators = filename.replace(/[/\\]/g, '_');
  const withoutControlChars = withoutPathSeparators.replace(/[\x00-\x1f\x7f]/g, '');
  const withoutLeadingDots = withoutControlChars.replace(/^\.+/, '');
  const normalized = withoutLeadingDots.trim().replace(/\s+/g, ' ');
  const safe = normalized.length > 0 ? normalized : 'file';
  return safe.slice(0, MAX_FILENAME_LENGTH);
}

/** Builds the server-generated storageKey for a new upload — never derived from the raw client filename alone. */
export function buildStorageKey(
  siteId: string,
  assetId: string,
  sanitizedFilename: string
): string {
  return `uploads/${siteId}/${assetId}/${sanitizedFilename}`;
}
