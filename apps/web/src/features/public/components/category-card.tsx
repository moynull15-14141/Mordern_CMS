import Link from 'next/link';
import type { PublicCategoryContent } from '../types/content.types';

/** Reusable category summary card — used by Home's "Category Highlights"
 * section (real data: `GET /public/categories`). */
export function CategoryCard({ category }: { category: PublicCategoryContent }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="flex flex-col gap-1 rounded-[var(--sportingspy-border-radius)] border border-gray-200 p-5 transition hover:border-[var(--sportingspy-color-primary)] hover:shadow-sm"
    >
      <h3 className="text-base font-semibold text-gray-900">{category.name}</h3>
      {category.description ? (
        <p className="line-clamp-2 text-sm text-gray-600">{category.description}</p>
      ) : null}
      <span className="mt-2 text-xs font-medium text-gray-500">
        {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'}
      </span>
    </Link>
  );
}
