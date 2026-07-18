import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { ThemesPageContent } from '@/features/themes';

/** `ThemesPageContent` reads `useSearchParams()` — requires a
 * `<Suspense>` boundary for static prerendering, same fix `/pages` needed. */
export default function ThemesPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.THEME_MANAGE}>
      <SuspenseBoundary>
        <ThemesPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
