import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreateArticlePageContent } from '@/features/articles';

export default function NewArticlePage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.ARTICLE_CREATE}>
      <CreateArticlePageContent />
    </PermissionRoute>
  );
}
