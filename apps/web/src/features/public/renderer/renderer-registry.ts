import type { ComponentType } from 'react';
import type { PublicContentType, ResolvedPublicContent } from '../types/content.types';
import { PageRenderer } from './page-renderer';
import { ArticleRenderer } from './article-renderer';
import { CategoryRenderer } from './category-renderer';
import { HomeRenderer } from './home-renderer';
import { BlogListRenderer } from './blog-list-renderer';
import { NotFoundRenderer } from './not-found-renderer';

/**
 * Maps a resolved content type to the component that renders it — the
 * milestone brief's "Renderer must be modular. Do NOT hardcode pages."
 * Adding a new content type later (e.g. eventual Block/Widget output)
 * means adding one registry entry, not branching inside `PublicRenderer`.
 *
 * Every content type this app can resolve to is registered (Milestone
 * 13.3: page/article/category/home/blog-list/not-found) — full coverage,
 * unlike Milestone 13.1 where only page/article/not-found existed.
 *
 * `ComponentType<any>` is a deliberate, narrow trade-off: a registry keyed
 * by a union's discriminant can't statically prove "the component at key K
 * only ever receives a context whose content.type is K" — `PublicRenderer`
 * enforces that invariant at the one call site that reads this map.
 */
export const RENDERER_REGISTRY: Partial<Record<PublicContentType, ComponentType<any>>> = {
  page: PageRenderer,
  article: ArticleRenderer,
  category: CategoryRenderer,
  home: HomeRenderer,
  'blog-list': BlogListRenderer,
  'not-found': NotFoundRenderer,
};

export function getRendererFor(content: ResolvedPublicContent): ComponentType<any> | undefined {
  return RENDERER_REGISTRY[content.type];
}
