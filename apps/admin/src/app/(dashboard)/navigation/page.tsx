import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { NavigationPageContent } from '@/features/navigation';

/** `NavigationPageContent` reads `useSearchParams()` — requires a
 * `<Suspense>` boundary for static prerendering, same fix `/patterns`
 * and `/reusable-blocks` needed. */
export default function NavigationPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.MENU_MANAGE}>
      <SuspenseBoundary>
        <NavigationPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
