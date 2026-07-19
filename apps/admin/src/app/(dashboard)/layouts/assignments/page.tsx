import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { AssignmentsPageContent } from '@/features/layouts';

/** `AssignmentsPageContent` reads `useSearchParams()` — requires a
 * `<Suspense>` boundary for static prerendering, same fix `/layouts` needed. */
export default function LayoutAssignmentsPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.LAYOUT_MANAGE}>
      <SuspenseBoundary>
        <AssignmentsPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
