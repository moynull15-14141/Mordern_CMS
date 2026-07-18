import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { MediaListPageContent } from '@/features/media';

/** `MediaListPageContent` reads `useSearchParams()` — requires a
 * `<Suspense>` boundary for static prerendering, same fix every other list
 * page needed. OR-gated across both real media permissions, matching the
 * backend's own `RequireAnyPermission` on `GET /media`. */
export default function MediaPage() {
  return (
    <PermissionRoute permissions={[PERMISSIONS.MEDIA_UPLOAD, PERMISSIONS.MEDIA_DELETE]}>
      <SuspenseBoundary>
        <MediaListPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
