import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { CategoriesPageContent } from '@/features/categories';

/** `CategoriesPageContent` reads `useSearchParams()` — requires a
 * `<Suspense>` boundary for static prerendering, same fix `/articles`
 * needed in Frontend Milestone 5. */
export default function CategoriesPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.CATEGORY_CREATE}>
      <SuspenseBoundary>
        <CategoriesPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
