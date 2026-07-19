/**
 * The named slots every theme layout arranges (milestone brief). Purely a
 * frontend rendering-composition concept — no backend data behind it — so
 * naming these is not "inventing a theme setting" the way a fake color/
 * layout field would be.
 */
export const SLOT_NAMES = {
  HEADER: 'header',
  PRIMARY_NAVIGATION: 'primaryNavigation',
  HERO: 'hero',
  BEFORE_CONTENT: 'beforeContent',
  CONTENT: 'content',
  AFTER_CONTENT: 'afterContent',
  SIDEBAR: 'sidebar',
  FOOTER_CTA: 'footerCta',
  FOOTER: 'footer',
} as const;

export type SlotName = (typeof SLOT_NAMES)[keyof typeof SLOT_NAMES];
