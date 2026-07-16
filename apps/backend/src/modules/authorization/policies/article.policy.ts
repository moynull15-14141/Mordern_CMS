import { Policy } from './policy.interface';

/** Foundation only — no implementation. Future subject shape once the
 * Articles module exists (e.g. ownership by authorId). */
export interface ArticlePolicySubject {
  authorId: string;
}

export type ArticlePolicy = Policy<ArticlePolicySubject>;
