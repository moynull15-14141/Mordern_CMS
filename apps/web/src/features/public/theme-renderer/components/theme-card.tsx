import type { ReactNode } from 'react';
import Link from 'next/link';

/** Generic bordered card — the shared visual base `ThemeArticle`/
 * `ThemeCategory` build on, and a standalone building block for any
 * future renderer. */
export function ThemeCard({
  children,
  href,
  className,
}: {
  children: ReactNode;
  href?: string;
  className?: string;
}) {
  const style = `rounded-[var(--sportingspy-radius,0.5rem)] border border-[var(--sportingspy-color-border)] bg-[var(--sportingspy-color-surface)] p-5${className ? ` ${className}` : ''}`;

  if (href) {
    return (
      <Link
        href={href}
        className={`block transition hover:border-[var(--sportingspy-color-primary)] ${style}`}
      >
        {children}
      </Link>
    );
  }

  return <div className={style}>{children}</div>;
}
