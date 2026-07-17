export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const COMBINING_DIACRITICAL_MARKS = /[̀-ͯ]/g;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICAL_MARKS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(capitalize)
    .join(' ');
}

export function initials(name: string, maxChars = 2): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxChars)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}
