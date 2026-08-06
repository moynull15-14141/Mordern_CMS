import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { ReusableBlocksPageContent } from '@/features/reusable-blocks';

/** `ReusableBlocksPageContent` reads `useSearchParams()` — requires a
 * `<Suspense>` boundary for static prerendering, same fix `/themes` needed. */
export default function ReusableBlocksPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <SuspenseBoundary>
        <ReusableBlocksPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
