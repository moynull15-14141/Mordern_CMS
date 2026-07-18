import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { PagesPageContent } from '@/features/pages';

/** `PagesPageContent` reads `useSearchParams()` — requires a `<Suspense>`
 * boundary for static prerendering, same fix `/articles` needed. */
export default function PagesPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <SuspenseBoundary>
        <PagesPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
