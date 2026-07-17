/** One detected reference to a `MediaAsset` from another table. Only
 * structurally real FK references are detected — see
 * docs/48_MEDIA_LIBRARY_ARCHITECTURE.md "Usage Detection" for what is (and
 * is deliberately not) covered. */
export interface MediaUsageReference {
  source: 'User.profileImage' | 'Author.profileImage' | 'Article.featuredMedia' | 'ArticleMedia';
  id: string;
  label: string;
}
