/** Public surface for the Patterns feature — only what `app/` (and the
 * Block Editor's Pattern Picker / Save-as-Pattern flow) actually needs. */
export { PatternsPageContent } from './components/patterns-page-content';
export { CreatePatternPageContent } from './components/create-pattern-page-content';
export { PatternDetailPageContent } from './components/pattern-detail-page-content';
export { EditPatternPageContent } from './components/edit-pattern-page-content';
export { SaveAsPatternDialog } from './components/save-as-pattern-dialog';

export { patternsApi } from './services/patterns.api';
export { usePatterns, usePattern, usePatternUsages } from './hooks/use-patterns';
export {
  useCreatePattern,
  useUpdatePattern,
  useDuplicatePattern,
  useArchivePattern,
  useUnarchivePattern,
  useDeletePattern,
  useRestorePattern,
} from './hooks/use-pattern-mutations';
export {
  useFavoritePatterns,
  useAddPatternFavorite,
  useRemovePatternFavorite,
} from './hooks/use-pattern-favorites';
export { useCreatePatternFromEditor } from './hooks/use-create-pattern-from-editor';
export { recordRecentlyUsedPattern, getRecentlyUsedPatternIds } from './utils/pattern-recency';

export type {
  Pattern,
  PatternSummary,
  PatternStatus,
  PatternSortField,
  PatternUsageContentType,
  PatternUsageReference,
  PatternFilters,
  CreatePatternInput,
  UpdatePatternInput,
} from './types/pattern';
