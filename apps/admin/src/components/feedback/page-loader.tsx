import { LoadingSpinner } from '@/components/feedback/loading-spinner';

/** Full-page loading, reserved for route transitions only —
 * docs/57_DESIGN_SYSTEM.md "Loading". */
export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <LoadingSpinner size="lg" label="Loading…" />
    </div>
  );
}
