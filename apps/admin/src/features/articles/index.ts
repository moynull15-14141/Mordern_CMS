/** Public surface for the Articles feature — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface": only what `app/` actually needs. */
export { ArticleTable } from './components/article-table';
export { ArticleFilters, type ArticleFiltersValue } from './components/article-filters';
export { CreateArticleForm, EditArticleForm } from './components/article-form';
export { StatusBadge } from './components/status-badge';
export { DeleteDialog } from './components/delete-dialog';
export { RestoreDialog } from './components/restore-dialog';
export { PublishDialog } from './components/publish-dialog';
export { ScheduleDialog } from './components/schedule-dialog';

// Page-level compositions — the only things `app/` actually imports.
export { ArticlesPageContent } from './components/articles-page-content';
export { CreateArticlePageContent } from './components/create-article-page-content';
export { ArticleDetailPageContent } from './components/article-detail-page-content';
export { EditArticlePageContent } from './components/edit-article-page-content';

export { useArticles } from './hooks/use-articles';
export { useArticle } from './hooks/use-article';
export { useCreateArticle } from './hooks/use-create-article';
export { useUpdateArticle } from './hooks/use-update-article';
export { useDeleteArticle } from './hooks/use-delete-article';
export { useRestoreArticle } from './hooks/use-restore-article';
export { usePublishArticle } from './hooks/use-publish-article';
export { useScheduleArticle } from './hooks/use-schedule-article';
export { useArticleRevisions } from './hooks/use-article-revisions';

export type {
  Article,
  ArticleFilters as ArticleFiltersType,
  ContentStatus,
  ArticleVisibility,
  CreateArticleInput,
  UpdateArticleInput,
  ScheduleArticleInput,
  ArticleRevision,
} from './types/article';
