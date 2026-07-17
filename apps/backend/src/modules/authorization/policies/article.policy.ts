import { Policy } from './policy.interface';

/**
 * Extended in Milestone 8 (Articles module) per this file's original
 * intent — "future subject shape once the Articles module exists." Article
 * ownership is indirect (`Article.authorId` -> `Author.id`, and
 * `Author.userId` is itself optional), so `authorUserId` is the linked
 * User's id (null if the Author row isn't linked to any User), needed to
 * check whether the acting user owns the article. `authorId` is unchanged.
 */
export interface ArticlePolicySubject {
  authorId: string;
  authorUserId: string | null;
}

export type ArticlePolicy = Policy<ArticlePolicySubject>;
