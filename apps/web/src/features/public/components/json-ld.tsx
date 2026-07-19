/**
 * Renders a page's `seo.schemaJson` (real backend data — `SeoMeta.schemaJson`)
 * as JSON-LD structured data. Next.js's Metadata API has no dedicated
 * JSON-LD field — a `<script type="application/ld+json">` tag is the
 * standard mechanism, per Next.js's own documented pattern.
 *
 * `<` is escaped to `<` before serializing — `JSON.stringify` alone
 * does not prevent a string value containing a literal `</script>` from
 * breaking out of the script tag; this is the standard mitigation for
 * injecting JSON into an HTML `<script>` element.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | null | undefined }) {
  if (!data) return null;

  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
