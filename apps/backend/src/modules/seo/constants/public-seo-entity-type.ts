/** The entity types `GET /public/seo/:entity/:slug` accepts — matches
 * exactly the three content types with both a real public slug lookup
 * (`PublicPagesService`/`PublicArticlesService`/`PublicCategoriesService`)
 * and a real `SeoService.getSeoForX()` method. Not a Prisma enum — this is
 * this endpoint's own route-param vocabulary. */
export const PUBLIC_SEO_ENTITY_TYPES = ['page', 'article', 'category'] as const;

export type PublicSeoEntityType = (typeof PUBLIC_SEO_ENTITY_TYPES)[number];

export function isPublicSeoEntityType(value: string): value is PublicSeoEntityType {
  return (PUBLIC_SEO_ENTITY_TYPES as readonly string[]).includes(value);
}
