import { resourceKeys } from '@/constants/query-keys';

const base = resourceKeys('seo');

export const seoKeys = {
  ...base,
  forArticle: (articleId: string) => ['seo', 'article', articleId] as const,
  forCategory: (categoryId: string) => ['seo', 'category', categoryId] as const,
};
