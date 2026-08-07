/** Mirrors `PublicPatternResponseDto` exactly. `body` is intentionally
 * `unknown` here too — same rationale as `PublicPageContent.body`/
 * `PublicArticleContent.body`: `parseBlocks()` is the one place that
 * trusts the shape. */
export interface PublicPattern {
  id: string;
  name: string;
  body: unknown;
}
