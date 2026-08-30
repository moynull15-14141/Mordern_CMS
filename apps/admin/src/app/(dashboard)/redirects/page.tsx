import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { RedirectsPageContent } from '@/features/redirects';

/** `RedirectsPageContent` reads `useSearchParams()` — requires a
 * `<Suspense>` boundary for static prerendering, same fix `/navigation`
 * and `/patterns` needed. */
export default function RedirectsPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <SuspenseBoundary>
        <RedirectsPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
