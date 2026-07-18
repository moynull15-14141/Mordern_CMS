import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { ArticlesPageContent } from '@/features/articles';

/** `ArticlesPageContent` reads `useSearchParams()` — requires a
 * `<Suspense>` boundary for static prerendering, same fix `/users` needed
 * in Frontend Milestone 3. OR-gated across all 4 article permissions,
 * matching the backend's own `RequireAnyPermission` on `GET /articles`. */
export default function ArticlesPage() {
  return (
    <PermissionRoute
      permissions={[
        PERMISSIONS.ARTICLE_CREATE,
        PERMISSIONS.ARTICLE_UPDATE,
        PERMISSIONS.ARTICLE_DELETE,
        PERMISSIONS.ARTICLE_PUBLISH,
      ]}
    >
      <SuspenseBoundary>
        <ArticlesPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
