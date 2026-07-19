import type { RenderContext } from '../types/render-context.types';
import type { PublicHomeContent } from '../types/content.types';
import { findSettingValue } from '../utils/settings-lookup.util';
import { Hero } from '../components/hero';
import { ArticleListSection } from '../components/article-list-section';
import { CategoryGridSection } from '../components/category-grid-section';
import { NewsletterCta } from '../components/newsletter-cta';
import { FooterCta } from '../components/footer-cta';

/**
 * Home page — composition only, over the existing renderer architecture
 * (milestone brief: "Composition only... NO Block Engine... NO JSON
 * layout"). Sections: Hero, Latest Articles, Featured Articles, Category
 * Highlights, Newsletter CTA, Footer CTA — each a plain, reusable React
 * component receiving real data already resolved onto `RenderContext`; no
 * section fetches anything itself.
 */
export function HomeRenderer({ context }: { context: RenderContext }) {
  const content = context.content as PublicHomeContent;
  const siteName = findSettingValue<string>(context.settings, 'general.siteName') ?? 'Home';
  const tagline = findSettingValue<string>(context.settings, 'general.siteTagline');

  return (
    <div
      data-testid="home-renderer"
      className="container-page flex flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8"
    >
      <Hero
        siteName={siteName}
        tagline={tagline}
        highlightArticle={content.latestArticles[0] ?? null}
      />
      <ArticleListSection
        title="Latest Articles"
        articles={content.latestArticles}
        viewAllHref="/blog"
      />
      <ArticleListSection
        title="Featured Articles"
        articles={content.featuredArticles}
        viewAllHref="/blog"
      />
      <CategoryGridSection categories={content.categories} />
      <NewsletterCta />
      <FooterCta settings={context.settings} />
    </div>
  );
}
