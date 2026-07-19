/** The content types `GET /public/layouts/resolve` accepts — mirrors
 * `PublicSeoEntityType`'s "lowercase, route-vocabulary, not a Prisma enum"
 * shape, extended with `'home'` (Layout is the only public module with a
 * homepage concept — SEO has no equivalent since the home page has no
 * `seo` field of its own). Mapped to the uppercase Prisma
 * `LayoutAssignmentContentType` at the service layer. */
export const PUBLIC_LAYOUT_CONTENT_TYPES = ['home', 'page', 'article', 'category'] as const;

export type PublicLayoutContentType = (typeof PUBLIC_LAYOUT_CONTENT_TYPES)[number];

export function isPublicLayoutContentType(value: string): value is PublicLayoutContentType {
  return (PUBLIC_LAYOUT_CONTENT_TYPES as readonly string[]).includes(value);
}
