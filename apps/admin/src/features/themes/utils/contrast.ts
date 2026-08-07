/**
 * WCAG 2.x contrast-ratio math (relative luminance → ratio) — a real,
 * standard formula, not a fake "AI accessibility score." Used to warn
 * (never block) when a chosen text/background color pair is hard to
 * read, per Milestone 8 Phase 13: "Do not pretend to provide a perfect
 * WCAG auditor unless actually implemented" — this implements the real
 * ratio calculation and the two real WCAG thresholds (4.5:1 normal text,
 * 3:1 large text/UI components), nothing beyond that.
 */

function hexToRgb(hex: string): [number, number, number] | null {
  const normalized = hex.trim().replace(/^#/, '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [r, g, b];
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** Returns `null` when either color isn't a parseable hex value (an
 * in-progress edit, an empty field) — callers treat `null` as "nothing
 * to warn about yet," not an error. */
export function getContrastRatio(foregroundHex: string, backgroundHex: string): number | null {
  const fg = hexToRgb(foregroundHex);
  const bg = hexToRgb(backgroundHex);
  if (!fg || !bg) return null;

  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export type ContrastLevel = 'fail' | 'aa-large' | 'aa';

export interface ContrastCheck {
  ratio: number;
  level: ContrastLevel;
  message: string;
}

/** `null` when either color can't be parsed yet — same "nothing to warn
 * about" convention as `getContrastRatio`. */
export function checkContrast(foregroundHex: string, backgroundHex: string): ContrastCheck | null {
  const ratio = getContrastRatio(foregroundHex, backgroundHex);
  if (ratio === null) return null;

  const rounded = Math.round(ratio * 100) / 100;
  if (ratio >= 4.5) {
    return { ratio: rounded, level: 'aa', message: `Good contrast (${rounded}:1).` };
  }
  if (ratio >= 3) {
    return {
      ratio: rounded,
      level: 'aa-large',
      message: `Contrast may be difficult to read for normal-sized text (${rounded}:1) — fine for large text/headings only.`,
    };
  }
  return {
    ratio: rounded,
    level: 'fail',
    message: `Contrast may be difficult to read (${rounded}:1) on ${backgroundHex} background.`,
  };
}
