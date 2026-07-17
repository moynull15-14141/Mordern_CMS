import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

/** 404 — Next.js special file, rendered automatically for any unmatched
 * route. docs item 16 "Error Handling: 404". */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <SearchX className="size-12 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Button asChild>
        <Link href={ROUTES.DASHBOARD}>Back to dashboard</Link>
      </Button>
    </div>
  );
}
