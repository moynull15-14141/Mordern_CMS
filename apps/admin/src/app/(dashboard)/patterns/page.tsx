import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { PatternsPageContent } from '@/features/patterns';

/** `PatternsPageContent` reads `useSearchParams()` — requires a
 * `<Suspense>` boundary for static prerendering, same fix `/reusable-blocks`
 * needed. */
export default function PatternsPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <SuspenseBoundary>
        <PatternsPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
