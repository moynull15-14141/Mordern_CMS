/** One Page or Article whose body references a given reusable block
 * anywhere in its block tree (at any depth). "Landing Pages"/"Templates"
 * aren't real content types in this codebase yet (only Page and Article
 * exist) — usage scanning covers exactly those two. */
export interface ReusableBlockUsageReference {
  contentType: 'page' | 'article';
  id: string;
  title: string;
  slug: string;
}
