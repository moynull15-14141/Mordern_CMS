import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { LayoutsPageContent } from '@/features/layouts';

/** `LayoutsPageContent` reads `useSearchParams()` — requires a
 * `<Suspense>` boundary for static prerendering, same fix `/themes` needed. */
export default function LayoutsPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.LAYOUT_MANAGE}>
      <SuspenseBoundary>
        <LayoutsPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
