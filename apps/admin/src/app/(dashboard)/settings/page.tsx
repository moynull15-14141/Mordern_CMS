import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { SettingsPageContent } from '@/features/settings';

/** `SettingsPageContent` reads `useSearchParams()` (page/sort/filter/search
 * state lives in the URL) — requires a `<Suspense>` boundary for static
 * prerendering, same fix Frontend Milestone 3 needed for `/users`
 * (docs/62_FRONTEND_AUTHENTICATION.md §9/§10). */
export default function SettingsPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.SETTINGS_MANAGE}>
      <SuspenseBoundary>
        <SettingsPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
