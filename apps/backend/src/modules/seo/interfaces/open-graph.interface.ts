/** Shape of the frozen `SeoMeta.openGraph: Json?` column's known keys.
 * Not schema — a documentation/validation aid only; the column stays a
 * loose JSON blob at the database level (per instruction, "Do not invent
 * schema"). */
export interface OpenGraphMeta {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  url?: string;
  site_name?: string;
  locale?: string;
}
