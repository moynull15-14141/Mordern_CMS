import type { PublicCategoryContent } from '../types/content.types';
import { CategoryCard } from './category-card';

/** Home page's "Category Highlights" section — real data:
 * `GET /public/categories`. */
export function CategoryGridSection({ categories }: { categories: PublicCategoryContent[] }) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="category-highlights-heading">
      <h2
        id="category-highlights-heading"
        className="text-2xl font-bold tracking-tight text-gray-900"
      >
        Explore by category
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>
    </section>
  );
}
