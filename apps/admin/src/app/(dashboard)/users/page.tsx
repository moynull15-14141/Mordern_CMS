import { PermissionRoute } from '@/components/guards/permission-route';
import { SuspenseBoundary } from '@/providers/suspense-boundary';
import { PERMISSIONS } from '@/constants/permissions';
import { UsersPageContent } from '@/features/users';

/** `UsersPageContent` reads `useSearchParams()` (page/sort/filter state
 * lives in the URL) — requires a `<Suspense>` boundary for static
 * prerendering, same fix Frontend Milestone 2 needed for `/login`'s
 * `GuestRoute` (docs/62_FRONTEND_AUTHENTICATION.md §9/§10). */
export default function UsersPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.USERS_MANAGE}>
      <SuspenseBoundary>
        <UsersPageContent />
      </SuspenseBoundary>
    </PermissionRoute>
  );
}
