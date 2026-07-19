import { PublicLoading } from '@/features/public/components/public-loading';

/** Next.js's special `loading.tsx` — streamed in automatically while any
 * route segment's Server Component is awaiting data (Performance:
 * "Streaming where appropriate"). Applies to every route under `app/`. */
export default function Loading() {
  return <PublicLoading />;
}
