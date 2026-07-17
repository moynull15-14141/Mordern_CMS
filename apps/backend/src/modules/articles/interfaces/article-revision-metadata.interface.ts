import { ContentStatus } from '@prisma/client';

/** "Compare revision metadata... No visual diff" per the milestone brief —
 * this is the metadata shape returned for each side of a comparison, not a
 * text/body diff. */
export interface ArticleRevisionMetadata {
  version: number;
  title: string;
  summary: string | null;
  status: ContentStatus;
  authorId: string;
  wordCount: number;
  createdAt: string;
  comment: string | null;
}
