import type { PublicCategoryContent } from '../../types/content.types';
import { ThemeCard } from './theme-card';
import { ThemeTitle } from './theme-title';

/** Themed category summary card — see `theme-article.tsx`'s doc comment
 * for the same "design-system equivalent, not yet adopted" note. */
export function ThemeCategory({ category }: { category: PublicCategoryContent }) {
  return (
    <ThemeCard href={`/category/${category.slug}`} className="flex flex-col gap-1">
      <ThemeTitle level={3}>{category.name}</ThemeTitle>
      {category.description ? (
        <p className="line-clamp-2 text-sm text-[var(--sportingspy-color-muted)]">
          {category.description}
        </p>
      ) : null}
      <span className="mt-2 text-xs font-medium text-[var(--sportingspy-color-muted)]">
        {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'}
      </span>
    </ThemeCard>
  );
}
