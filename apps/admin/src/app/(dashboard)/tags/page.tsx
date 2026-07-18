import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { TagsPageContent } from '@/features/tags';

/** `TagsPageContent` reads `useSearchParams()` — requires a `<Suspense>`
 * boundary for static prerendering, same fix `/categories` needed. */
export default function TagsPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.CATEGORY_CREATE}>
      <SuspenseBoundary>
        <TagsPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
