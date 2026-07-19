import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'outline';

const VARIANT_STYLES: Record<Variant, string> = {
  primary: 'bg-[var(--sportingspy-color-primary)] text-white hover:opacity-90',
  secondary: 'bg-[var(--sportingspy-color-accent)] text-white hover:opacity-90',
  outline:
    'border border-[var(--sportingspy-color-border)] text-[var(--sportingspy-color-text)] hover:border-[var(--sportingspy-color-primary)]',
};

const BASE_STYLE =
  'inline-flex items-center justify-center rounded-[var(--sportingspy-radius,0.5rem)] px-5 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sportingspy-color-primary)] disabled:cursor-not-allowed disabled:opacity-60';

interface ThemeButtonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  /** Renders an `<a>` (via `next/link`) instead of a `<button>` when set. */
  href?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  disabled?: boolean;
}

/**
 * Themed button/link — every visual variant reads only the real/derived
 * `--sportingspy-color-*` variables (`theme-css-variables.util.ts`), never
 * a hardcoded hex color. Renders an `<a>` (via `next/link`) when `href` is
 * given, a native `<button>` otherwise — one component, both use cases,
 * so a renderer never has to pick between two near-identical primitives.
 *
 * Deliberately has no `onClick` prop — a Server Component (this one) can't
 * pass an event handler function to a DOM element without becoming a
 * Client Component itself. A future interactive use case should wrap this
 * in its own small `'use client'` component rather than adding one here.
 */
export function ThemeButton({
  variant = 'primary',
  children,
  className,
  href,
  type = 'button',
  disabled,
}: ThemeButtonProps) {
  const style = `${BASE_STYLE} ${VARIANT_STYLES[variant]}${className ? ` ${className}` : ''}`;

  if (href) {
    return (
      <Link href={href} className={style}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={style}>
      {children}
    </button>
  );
}
