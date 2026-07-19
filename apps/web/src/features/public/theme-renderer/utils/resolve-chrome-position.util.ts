export type ChromePosition = 'sticky' | 'static';

/**
 * Interprets the real, open-ended `theme.layout.header`/`theme.layout.footer`
 * string fields (`PublicThemeResponseDto`) as a header/footer positioning
 * choice — this app's own convention (documented, not a backend enum): the
 * literal value `"fixed"` (case-insensitive) means "keep this bar on
 * screen while the page scrolls," implemented with CSS `position: sticky`
 * (not `fixed` — `sticky` doesn't need extra top-padding hacks to avoid
 * covering content, and degrades to normal flow when there's no room to
 * stick). Anything else (`null`, unrecognized text) means normal, static
 * positioning — never an error.
 */
export function resolveChromePosition(value: string | null): ChromePosition {
  return value?.trim().toLowerCase() === 'fixed' ? 'sticky' : 'static';
}
